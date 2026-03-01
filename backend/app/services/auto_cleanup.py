from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.entities import Campaign, CampaignStat, MPAccount, Marketplace, QueryLabel, QueryLabelStatus, SearchQuery
from app.services.morphology import upsert_minus_words
from app.services.ozon_api import OzonApiClient
from app.services.wb_api import WBApiClient


@dataclass
class QueryAggregate:
    query: str
    impressions: int
    clicks: int
    spend: float
    orders: int
    ctr: float
    cpc: float
    revenue: float
    drr: float
    rules_triggered: list[str] = field(default_factory=list)


@dataclass
class AutoCleanupResult:
    campaign_id: int
    campaign_name: str
    auto_minus_enabled: bool
    irrelevant_found: int
    minus_words: list[str]
    budget_wasted: float
    budget_saved: float
    auto_applied: bool
    apply_failed: int
    queries: list[QueryAggregate] = field(default_factory=list)


def _calc_rate(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _estimate_average_order_value(db: Session, campaign_id: int, date_from: date) -> float:
    revenue, orders = db.execute(
        select(
            func.coalesce(func.sum(CampaignStat.revenue), 0),
            func.coalesce(func.sum(CampaignStat.orders), 0),
        ).where(CampaignStat.campaign_id == campaign_id, CampaignStat.date >= date_from)
    ).one()
    revenue_float = float(revenue or 0.0)
    orders_int = int(orders or 0)
    if orders_int > 0:
        return revenue_float / orders_int

    revenue, orders = db.execute(
        select(
            func.coalesce(func.sum(CampaignStat.revenue), 0),
            func.coalesce(func.sum(CampaignStat.orders), 0),
        ).where(CampaignStat.campaign_id == campaign_id)
    ).one()
    revenue_float = float(revenue or 0.0)
    orders_int = int(orders or 0)
    if orders_int > 0:
        return revenue_float / orders_int
    return 0.0


def _detect_irrelevant_rules(query: QueryAggregate, avg_campaign_cpc: float) -> list[str]:
    rules: list[str] = []
    if query.clicks > 30 and query.orders == 0 and query.spend > 300:
        rules.append("rule_1")
    if query.ctr < 0.3 and query.impressions > 2000:
        rules.append("rule_2")
    if query.drr > 40 and query.orders < 3:
        rules.append("rule_3")
    if query.spend > 1000 and query.orders == 0:
        rules.append("rule_4")
    if avg_campaign_cpc > 0 and query.cpc > avg_campaign_cpc * 2.5 and query.orders == 0:
        rules.append("rule_5")
    return rules


def _load_campaign(db: Session, campaign_id: int) -> Campaign | None:
    return db.execute(
        select(Campaign).where(Campaign.id == campaign_id).options(joinedload(Campaign.account))
    ).scalar_one_or_none()


def _aggregate_campaign_queries(db: Session, campaign_id: int, date_from: date, avg_order_value: float) -> list[QueryAggregate]:
    rows = db.execute(
        select(
            SearchQuery.query,
            func.coalesce(func.sum(SearchQuery.impressions), 0),
            func.coalesce(func.sum(SearchQuery.clicks), 0),
            func.coalesce(func.sum(SearchQuery.spend), 0),
            func.coalesce(func.sum(SearchQuery.orders), 0),
        )
        .where(SearchQuery.campaign_id == campaign_id, SearchQuery.date >= date_from)
        .group_by(SearchQuery.query)
    ).all()

    aggregated: list[QueryAggregate] = []
    for query_text, impressions, clicks, spend, orders in rows:
        impressions_int = int(impressions or 0)
        clicks_int = int(clicks or 0)
        spend_float = float(spend or 0.0)
        orders_int = int(orders or 0)
        ctr = _calc_rate(clicks_int * 100, impressions_int)
        cpc = _calc_rate(spend_float, clicks_int)
        revenue = float(avg_order_value * orders_int)
        # Treat spend with zero revenue as very high DRR.
        drr = _calc_rate(spend_float * 100, revenue) if revenue > 0 else (999.0 if spend_float > 0 else 0.0)
        aggregated.append(
            QueryAggregate(
                query=str(query_text),
                impressions=impressions_int,
                clicks=clicks_int,
                spend=spend_float,
                orders=orders_int,
                ctr=ctr,
                cpc=cpc,
                revenue=revenue,
                drr=drr,
            )
        )
    return aggregated


async def _auto_apply_minus_words(campaign: Campaign, minus_words: list[str]) -> tuple[bool, int]:
    if not minus_words:
        return (False, 0)
    account = campaign.account
    if account is None:
        return (False, len(minus_words))

    try:
        if account.marketplace == Marketplace.WB:
            if not account.api_token:
                return (False, len(minus_words))
            async with WBApiClient(account.api_token, account.id) as wb:
                await wb.add_minus_phrases(campaign.external_id, minus_words)
            return (True, 0)
        if account.marketplace == Marketplace.OZON:
            if not account.client_id or not account.api_key:
                return (False, len(minus_words))
            async with OzonApiClient(account.client_id, account.api_key) as ozon:
                await ozon.add_negative_keywords(campaign.external_id, minus_words)
            return (True, 0)
    except Exception:
        return (False, len(minus_words))
    return (False, len(minus_words))


async def auto_cleanup_campaign(
    db: Session,
    campaign: Campaign,
    *,
    days: int = 7,
    force_auto_apply: bool | None = None,
) -> AutoCleanupResult:
    active_days = max(1, days)
    date_from = date.today() - timedelta(days=active_days - 1)
    avg_order_value = _estimate_average_order_value(db, campaign.id, date_from)
    aggregated = _aggregate_campaign_queries(db, campaign.id, date_from, avg_order_value)

    total_clicks = sum(item.clicks for item in aggregated)
    total_spend = sum(item.spend for item in aggregated)
    avg_campaign_cpc = _calc_rate(total_spend, total_clicks)

    marked_queries: list[QueryAggregate] = []
    budget_wasted = 0.0
    labeled_at = datetime.now(UTC)
    for item in aggregated:
        item.rules_triggered = _detect_irrelevant_rules(item, avg_campaign_cpc)
        if not item.rules_triggered:
            continue
        marked_queries.append(item)
        budget_wasted += item.spend

        label = db.execute(
            select(QueryLabel).where(QueryLabel.campaign_id == campaign.id, QueryLabel.query == item.query)
        ).scalar_one_or_none()
        if label is None:
            label = QueryLabel(campaign_id=campaign.id, query=item.query)
            db.add(label)
        label.label = QueryLabelStatus.NOT_RELEVANT
        label.labeled_by = None
        label.labeled_at = labeled_at
    if marked_queries:
        db.commit()

    minus_words = upsert_minus_words(db, campaign.id, [item.query for item in marked_queries]) if marked_queries else []

    should_auto_apply = force_auto_apply if force_auto_apply is not None else campaign.auto_minus_enabled
    auto_applied = False
    apply_failed = 0
    if should_auto_apply and minus_words:
        auto_applied, apply_failed = await _auto_apply_minus_words(campaign, minus_words)

    budget_saved = budget_wasted / active_days
    return AutoCleanupResult(
        campaign_id=campaign.id,
        campaign_name=campaign.name,
        auto_minus_enabled=campaign.auto_minus_enabled,
        irrelevant_found=len(marked_queries),
        minus_words=minus_words,
        budget_wasted=round(budget_wasted, 2),
        budget_saved=round(budget_saved, 2),
        auto_applied=auto_applied,
        apply_failed=apply_failed,
        queries=sorted(marked_queries, key=lambda item: item.spend, reverse=True),
    )


async def auto_cleanup_campaign_by_id(
    db: Session,
    campaign_id: int,
    *,
    days: int = 7,
    force_auto_apply: bool | None = None,
) -> AutoCleanupResult | None:
    campaign = _load_campaign(db, campaign_id)
    if campaign is None:
        return None
    return await auto_cleanup_campaign(db, campaign, days=days, force_auto_apply=force_auto_apply)


async def auto_cleanup_user_campaigns(
    db: Session,
    user_id: int,
    *,
    days: int = 7,
    only_auto_minus_enabled: bool = False,
    force_auto_apply: bool | None = None,
) -> list[AutoCleanupResult]:
    stmt = (
        select(Campaign)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.user_id == user_id)
        .options(joinedload(Campaign.account))
        .order_by(Campaign.id.asc())
    )
    if only_auto_minus_enabled:
        stmt = stmt.where(Campaign.auto_minus_enabled.is_(True))
    campaigns = db.execute(stmt).scalars().all()
    results: list[AutoCleanupResult] = []
    for campaign in campaigns:
        results.append(await auto_cleanup_campaign(db, campaign, days=days, force_auto_apply=force_auto_apply))
    return results


async def auto_cleanup_all_campaigns(
    db: Session,
    *,
    days: int = 7,
    only_auto_minus_enabled: bool = True,
    force_auto_apply: bool = True,
) -> list[AutoCleanupResult]:
    stmt = (
        select(Campaign)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.is_active.is_(True))
        .options(joinedload(Campaign.account))
        .order_by(Campaign.id.asc())
    )
    if only_auto_minus_enabled:
        stmt = stmt.where(Campaign.auto_minus_enabled.is_(True))

    campaigns = db.execute(stmt).scalars().all()
    results: list[AutoCleanupResult] = []
    for campaign in campaigns:
        results.append(await auto_cleanup_campaign(db, campaign, days=days, force_auto_apply=force_auto_apply))
    return results
