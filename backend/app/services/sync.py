from __future__ import annotations

import asyncio
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import Select, and_, delete, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.entities import (
    Alert,
    BudgetAction,
    BudgetRule,
    Campaign,
    CampaignStat,
    MPAccount,
    Marketplace,
    QueryLabel,
    QueryLabelStatus,
    SearchQuery,
    User,
)
from app.services.exceptions import MarketplaceAuthError
from app.services.ozon_api import OzonApiClient
from app.services.relevancy import classify_query_default
from app.services.wb_api import WBApiClient


def _extract_list(payload: Any) -> list[dict[str, Any]]:
    if payload is None:
        return []
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("result", "data", "items", "list", "campaigns", "adverts"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
        return [payload]
    return []


def _as_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        normalized = value.replace(",", ".")
        try:
            return float(normalized)
        except ValueError:
            return 0.0
    return 0.0


def _as_int(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value.replace(",", ".")))
        except ValueError:
            return 0
    return 0


def _parse_date(value: Any) -> date:
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        raw = value.strip()
        raw = raw.replace("Z", "+00:00")
        for parser in (datetime.fromisoformat,):
            try:
                return parser(raw).date()
            except ValueError:
                continue
        try:
            return datetime.strptime(raw, "%Y-%m-%d").date()
        except ValueError:
            return date.today()
    return date.today()


def _calc_rate(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


async def sync_account_campaigns(account: MPAccount, db: Session) -> int:
    updated = 0
    if account.marketplace == Marketplace.WB:
        if not account.api_token:
            return 0
        async with WBApiClient(account.api_token, account.id) as wb:
            campaigns_payload = await wb.get_campaigns()
            campaigns = _extract_list(campaigns_payload)
    else:
        if not account.client_id or not account.api_key:
            return 0
        async with OzonApiClient(account.client_id, account.api_key) as ozon:
            campaigns_payload = await ozon.get_campaigns()
            campaigns = _extract_list(campaigns_payload)

    for raw in campaigns:
        external_id = str(raw.get("advertId") or raw.get("campaign_id") or raw.get("id") or "")
        if not external_id:
            continue

        campaign = db.execute(
            select(Campaign).where(Campaign.account_id == account.id, Campaign.external_id == external_id)
        ).scalar_one_or_none()

        if campaign is None:
            campaign = Campaign(
                account_id=account.id,
                external_id=external_id,
                name=raw.get("name") or raw.get("title") or f"Campaign {external_id}",
            )
            db.add(campaign)

        campaign.name = raw.get("name") or raw.get("title") or campaign.name
        campaign.type = str(raw.get("type", campaign.type or "unknown"))
        campaign.status = str(raw.get("status", campaign.status or "unknown"))
        campaign.daily_budget = _as_float(raw.get("dailyBudget") or raw.get("daily_budget") or raw.get("budget"))
        updated += 1

    account.last_synced_at = datetime.now(UTC)
    db.commit()
    return updated


async def _sync_campaign_stats_wb(account: MPAccount, campaigns: list[Campaign], db: Session, days: int) -> int:
    if not account.api_token or not campaigns:
        return 0

    date_values = [date.today() - timedelta(days=offset) for offset in range(days)]
    date_strings = [value.isoformat() for value in date_values]
    written = 0

    async with WBApiClient(account.api_token, account.id) as wb:
        stats_payload = await wb.get_full_stats([campaign.external_id for campaign in campaigns], date_strings)
    blocks = _extract_list(stats_payload)

    external_id_to_campaign = {campaign.external_id: campaign for campaign in campaigns}
    for block in blocks:
        external_id = str(block.get("advertId") or block.get("id") or "")
        campaign = external_id_to_campaign.get(external_id)
        if not campaign:
            continue
        daily_rows = block.get("days") or block.get("stats") or block.get("result") or []
        if isinstance(daily_rows, dict):
            daily_rows = [daily_rows]
        if not isinstance(daily_rows, list):
            continue

        for row in daily_rows:
            if not isinstance(row, dict):
                continue
            row_date = _parse_date(row.get("date") or row.get("dt") or row.get("day"))
            impressions = _as_int(row.get("impressions") or row.get("shows"))
            clicks = _as_int(row.get("clicks"))
            spend = _as_float(row.get("sum") or row.get("spend"))
            orders = _as_int(row.get("orders") or row.get("atbs"))
            revenue = _as_float(row.get("revenue") or row.get("ordersSum"))
            ctr = _as_float(row.get("ctr")) or _calc_rate(clicks * 100, impressions)
            cpc = _as_float(row.get("cpc")) or _calc_rate(spend, clicks)
            cpo = _as_float(row.get("cpo")) or _calc_rate(spend, orders)
            drr = _calc_rate(spend * 100, revenue)

            stat = db.execute(
                select(CampaignStat).where(CampaignStat.campaign_id == campaign.id, CampaignStat.date == row_date)
            ).scalar_one_or_none()

            if stat is None:
                stat = CampaignStat(campaign_id=campaign.id, date=row_date)
                db.add(stat)
            stat.impressions = impressions
            stat.clicks = clicks
            stat.spend = spend
            stat.orders = orders
            stat.revenue = revenue
            stat.ctr = ctr
            stat.cpc = cpc
            stat.cpo = cpo
            stat.drr = drr
            written += 1

    db.commit()
    return written


async def _sync_campaign_stats_ozon(account: MPAccount, campaigns: list[Campaign], db: Session, days: int) -> int:
    if not account.client_id or not account.api_key or not campaigns:
        return 0
    from_date = (date.today() - timedelta(days=days - 1)).isoformat()
    to_date = date.today().isoformat()
    written = 0

    async with OzonApiClient(account.client_id, account.api_key) as ozon:
        payload = await ozon.get_statistics([campaign.external_id for campaign in campaigns], from_date, to_date)

    blocks = _extract_list(payload)
    external_id_to_campaign = {campaign.external_id: campaign for campaign in campaigns}
    for block in blocks:
        external_id = str(block.get("campaign_id") or block.get("id") or "")
        campaign = external_id_to_campaign.get(external_id)
        if not campaign:
            continue
        rows = block.get("rows") or block.get("stats") or block.get("days") or [block]
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, dict):
                continue
            row_date = _parse_date(row.get("date") or row.get("day"))
            impressions = _as_int(row.get("impressions") or row.get("shows"))
            clicks = _as_int(row.get("clicks"))
            spend = _as_float(row.get("spend") or row.get("cost"))
            orders = _as_int(row.get("orders"))
            revenue = _as_float(row.get("revenue"))
            ctr = _as_float(row.get("ctr")) or _calc_rate(clicks * 100, impressions)
            cpc = _as_float(row.get("cpc")) or _calc_rate(spend, clicks)
            cpo = _as_float(row.get("cpo")) or _calc_rate(spend, orders)
            drr = _calc_rate(spend * 100, revenue)

            stat = db.execute(
                select(CampaignStat).where(CampaignStat.campaign_id == campaign.id, CampaignStat.date == row_date)
            ).scalar_one_or_none()
            if stat is None:
                stat = CampaignStat(campaign_id=campaign.id, date=row_date)
                db.add(stat)
            stat.impressions = impressions
            stat.clicks = clicks
            stat.spend = spend
            stat.orders = orders
            stat.revenue = revenue
            stat.ctr = ctr
            stat.cpc = cpc
            stat.cpo = cpo
            stat.drr = drr
            written += 1

    db.commit()
    return written


async def sync_account_campaign_stats(account: MPAccount, db: Session, days: int = 7) -> int:
    campaigns = db.execute(select(Campaign).where(Campaign.account_id == account.id)).scalars().all()
    if account.marketplace == Marketplace.WB:
        return await _sync_campaign_stats_wb(account, campaigns, db, days)
    return await _sync_campaign_stats_ozon(account, campaigns, db, days)


async def _sync_search_queries_wb(account: MPAccount, campaigns: list[Campaign], db: Session, days: int) -> int:
    if not account.api_token:
        return 0
    from_date = (date.today() - timedelta(days=days - 1)).isoformat()
    to_date = date.today().isoformat()
    written = 0

    async with WBApiClient(account.api_token, account.id) as wb:
        for campaign in campaigns:
            payload = await wb.get_search_query_stats(campaign.external_id, from_date, to_date)
            items = _extract_list(payload)
            for item in items:
                query_text = item.get("keyword") or item.get("query") or item.get("phrase")
                if not query_text:
                    continue
                row_date = _parse_date(item.get("date") or to_date)
                impressions = _as_int(item.get("impressions") or item.get("shows"))
                clicks = _as_int(item.get("clicks"))
                spend = _as_float(item.get("sum") or item.get("spend"))
                orders = _as_int(item.get("orders"))
                ctr = _as_float(item.get("ctr")) or _calc_rate(clicks * 100, impressions)
                cpc = _as_float(item.get("cpc")) or _calc_rate(spend, clicks)
                cpo = _as_float(item.get("cpo")) or _calc_rate(spend, orders)

                search_query = db.execute(
                    select(SearchQuery).where(
                        and_(
                            SearchQuery.campaign_id == campaign.id,
                            SearchQuery.query == query_text,
                            SearchQuery.date == row_date,
                        )
                    )
                ).scalar_one_or_none()
                if search_query is None:
                    search_query = SearchQuery(campaign_id=campaign.id, query=query_text, date=row_date)
                    db.add(search_query)
                search_query.impressions = impressions
                search_query.clicks = clicks
                search_query.spend = spend
                search_query.orders = orders
                search_query.ctr = ctr
                search_query.cpc = cpc
                search_query.cpo = cpo

                existing_label = db.execute(
                    select(QueryLabel).where(QueryLabel.campaign_id == campaign.id, QueryLabel.query == query_text)
                ).scalar_one_or_none()
                if existing_label is None:
                    db.add(
                        QueryLabel(
                            campaign_id=campaign.id,
                            query=query_text,
                            label=classify_query_default(ctr=ctr, impressions=impressions, orders=orders),
                        )
                    )
                written += 1
    db.commit()
    return written


async def _sync_search_queries_ozon(account: MPAccount, campaigns: list[Campaign], db: Session, days: int) -> int:
    if not account.client_id or not account.api_key:
        return 0
    from_date = (date.today() - timedelta(days=days - 1)).isoformat()
    to_date = date.today().isoformat()
    written = 0

    async with OzonApiClient(account.client_id, account.api_key) as ozon:
        for campaign in campaigns:
            payload = await ozon.get_search_phrases(campaign.external_id, from_date, to_date)
            items = _extract_list(payload)
            for item in items:
                query_text = item.get("search_phrase") or item.get("query") or item.get("phrase")
                if not query_text:
                    continue
                row_date = _parse_date(item.get("date") or to_date)
                impressions = _as_int(item.get("impressions"))
                clicks = _as_int(item.get("clicks"))
                spend = _as_float(item.get("spend") or item.get("cost"))
                orders = _as_int(item.get("orders"))
                ctr = _as_float(item.get("ctr")) or _calc_rate(clicks * 100, impressions)
                cpc = _as_float(item.get("cpc")) or _calc_rate(spend, clicks)
                cpo = _as_float(item.get("cpo")) or _calc_rate(spend, orders)

                search_query = db.execute(
                    select(SearchQuery).where(
                        and_(
                            SearchQuery.campaign_id == campaign.id,
                            SearchQuery.query == query_text,
                            SearchQuery.date == row_date,
                        )
                    )
                ).scalar_one_or_none()
                if search_query is None:
                    search_query = SearchQuery(campaign_id=campaign.id, query=query_text, date=row_date)
                    db.add(search_query)
                search_query.impressions = impressions
                search_query.clicks = clicks
                search_query.spend = spend
                search_query.orders = orders
                search_query.ctr = ctr
                search_query.cpc = cpc
                search_query.cpo = cpo

                existing_label = db.execute(
                    select(QueryLabel).where(QueryLabel.campaign_id == campaign.id, QueryLabel.query == query_text)
                ).scalar_one_or_none()
                if existing_label is None:
                    db.add(
                        QueryLabel(
                            campaign_id=campaign.id,
                            query=query_text,
                            label=classify_query_default(ctr=ctr, impressions=impressions, orders=orders),
                        )
                    )
                written += 1
    db.commit()
    return written


async def sync_account_search_queries(account: MPAccount, db: Session, days: int = 30) -> int:
    campaigns = db.execute(select(Campaign).where(Campaign.account_id == account.id)).scalars().all()
    if account.marketplace == Marketplace.WB:
        return await _sync_search_queries_wb(account, campaigns, db, days)
    return await _sync_search_queries_ozon(account, campaigns, db, days)


async def sync_all_accounts_campaigns(db: Session) -> dict[str, int]:
    accounts = db.execute(select(MPAccount).where(MPAccount.is_active.is_(True))).scalars().all()
    results = {"updated_campaigns": 0, "auth_errors": 0}
    for account in accounts:
        try:
            results["updated_campaigns"] += await sync_account_campaigns(account, db)
        except MarketplaceAuthError:
            account.needs_reconnection = True
            db.commit()
            results["auth_errors"] += 1
    return results


async def sync_all_campaign_stats(db: Session) -> dict[str, int]:
    accounts = db.execute(select(MPAccount).where(MPAccount.is_active.is_(True))).scalars().all()
    results = {"updated_stats": 0, "auth_errors": 0}
    for account in accounts:
        try:
            results["updated_stats"] += await sync_account_campaign_stats(account, db, days=7)
            account.last_synced_at = datetime.now(UTC)
            db.commit()
        except MarketplaceAuthError:
            account.needs_reconnection = True
            db.commit()
            results["auth_errors"] += 1
    return results


async def sync_all_search_queries(db: Session) -> dict[str, int]:
    accounts = db.execute(select(MPAccount).where(MPAccount.is_active.is_(True))).scalars().all()
    results = {"updated_queries": 0, "auth_errors": 0}
    for account in accounts:
        try:
            results["updated_queries"] += await sync_account_search_queries(account, db, days=30)
            account.last_synced_at = datetime.now(UTC)
            db.commit()
        except MarketplaceAuthError:
            account.needs_reconnection = True
            db.commit()
            results["auth_errors"] += 1
    return results


def create_alert(db: Session, user_id: int, campaign_id: int | None, alert_type: str, message: str) -> Alert:
    alert = Alert(user_id=user_id, campaign_id=campaign_id, type=alert_type, message=message)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


async def pause_or_resume_campaign(campaign: Campaign, pause: bool) -> None:
    account = campaign.account
    if account.marketplace == Marketplace.WB and account.api_token:
        async with WBApiClient(account.api_token, account.id) as wb:
            if pause:
                await wb.pause_campaign(campaign.external_id)
            else:
                await wb.resume_campaign(campaign.external_id)
    elif account.marketplace == Marketplace.OZON and account.client_id and account.api_key:
        async with OzonApiClient(account.client_id, account.api_key) as ozon:
            if pause:
                await ozon.deactivate_campaign(campaign.external_id)
            else:
                await ozon.activate_campaign(campaign.external_id)


async def check_budget_rules(db: Session) -> int:
    today = date.today()
    rules = db.execute(
        select(BudgetRule).where(BudgetRule.is_active.is_(True)).options(joinedload(BudgetRule.campaign).joinedload(Campaign.account))
    ).scalars().all()
    triggered = 0
    for rule in rules:
        campaign = rule.campaign
        if not campaign:
            continue
        day_stat = db.execute(
            select(CampaignStat).where(CampaignStat.campaign_id == campaign.id, CampaignStat.date == today)
        ).scalar_one_or_none()
        if not day_stat:
            continue

        exceeded = False
        if rule.rule_type.value == "daily_budget":
            exceeded = _as_float(day_stat.spend) > rule.threshold
        elif rule.rule_type.value == "drr":
            exceeded = _as_float(day_stat.drr) > rule.threshold

        if not exceeded:
            continue
        triggered += 1
        user_id = campaign.account.user_id
        reason = f"{rule.rule_type.value} exceeded for campaign '{campaign.name}' ({campaign.external_id})"
        create_alert(db, user_id=user_id, campaign_id=campaign.id, alert_type="budget_rule", message=reason)
        if rule.action == BudgetAction.PAUSE_CAMPAIGN:
            await pause_or_resume_campaign(campaign, pause=True)
            campaign.status = "paused"
            db.commit()
    return triggered


def daily_summary_by_user(db: Session) -> dict[int, dict[str, float]]:
    today = date.today()
    query: Select[Any] = (
        select(
            User.id,
            func.coalesce(func.sum(CampaignStat.spend), 0).label("spend"),
            func.coalesce(func.sum(CampaignStat.orders), 0).label("orders"),
            func.coalesce(func.sum(CampaignStat.revenue), 0).label("revenue"),
        )
        .join(MPAccount, MPAccount.user_id == User.id)
        .join(Campaign, Campaign.account_id == MPAccount.id)
        .join(CampaignStat, CampaignStat.campaign_id == Campaign.id)
        .where(CampaignStat.date == today)
        .group_by(User.id)
    )
    rows = db.execute(query).all()
    result: dict[int, dict[str, float]] = {}
    for user_id, spend, orders, revenue in rows:
        spend_val = _as_float(spend)
        revenue_val = _as_float(revenue)
        drr = _calc_rate(spend_val * 100, revenue_val)
        result[int(user_id)] = {
            "spend": spend_val,
            "orders": float(_as_int(orders)),
            "revenue": revenue_val,
            "drr": drr,
        }
    return result


async def refresh_user_data(user_id: int, db: Session) -> dict[str, int]:
    accounts = db.execute(select(MPAccount).where(MPAccount.user_id == user_id, MPAccount.is_active.is_(True))).scalars().all()
    result = defaultdict(int)
    for account in accounts:
        try:
            result["campaigns"] += await sync_account_campaigns(account, db)
            result["stats"] += await sync_account_campaign_stats(account, db)
            result["queries"] += await sync_account_search_queries(account, db)
            account.last_synced_at = datetime.now(UTC)
            db.commit()
        except MarketplaceAuthError:
            account.needs_reconnection = True
            db.commit()
            result["auth_errors"] += 1
    return dict(result)


def clear_old_alerts(db: Session, days: int = 60) -> int:
    border = datetime.now(UTC) - timedelta(days=days)
    result = db.execute(delete(Alert).where(Alert.created_at < border))
    db.commit()
    return int(result.rowcount or 0)


def run_async(coro: Any) -> Any:
    return asyncio.run(coro)
