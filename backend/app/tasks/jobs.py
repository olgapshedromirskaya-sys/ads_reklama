from __future__ import annotations

from datetime import date
from typing import Any

import httpx
from celery import shared_task
from sqlalchemy import and_, func, select

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.entities import Alert, Campaign, KeywordPosition, MPAccount, QueryLabel, SearchQuery, User, WatchlistKeyword
from app.services.sync import (
    check_budget_rules,
    clear_old_alerts,
    daily_summary_by_user,
    run_async,
    sync_all_accounts_campaigns,
    sync_all_campaign_stats,
    sync_all_search_queries,
)


def _send_telegram_message(telegram_id: int, text: str) -> None:
    settings = get_settings()
    if not settings.telegram_bot_token:
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        with httpx.Client(timeout=10) as client:
            client.post(url, json={"chat_id": telegram_id, "text": text})
    except httpx.HTTPError:
        # Non-critical for background tasks.
        return


@shared_task(name="app.tasks.jobs.sync_campaign_stats_task")
def sync_campaign_stats_task() -> dict[str, Any]:
    with SessionLocal() as db:
        campaigns_result = run_async(sync_all_accounts_campaigns(db))
        stats_result = run_async(sync_all_campaign_stats(db))
        return {"campaigns": campaigns_result, "stats": stats_result}


@shared_task(name="app.tasks.jobs.sync_search_queries_task")
def sync_search_queries_task() -> dict[str, Any]:
    with SessionLocal() as db:
        queries_result = run_async(sync_all_search_queries(db))
        return {"queries": queries_result}


@shared_task(name="app.tasks.jobs.check_budget_rules_task")
def check_budget_rules_task() -> dict[str, Any]:
    with SessionLocal() as db:
        triggered = run_async(check_budget_rules(db))

        # Alert for newly observed highly irrelevant queries.
        suspicious_rows = db.execute(
            select(Campaign.id, Campaign.name, MPAccount.user_id, func.count(SearchQuery.id))
            .join(SearchQuery, SearchQuery.campaign_id == Campaign.id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(
                and_(
                    SearchQuery.date == date.today(),
                    SearchQuery.ctr < 1.0,
                    SearchQuery.impressions >= 500,
                    SearchQuery.orders == 0,
                )
            )
            .group_by(Campaign.id, Campaign.name, MPAccount.user_id)
        ).all()

        created = 0
        for campaign_id, campaign_name, user_id, count in suspicious_rows:
            message = f"Detected {count} potentially irrelevant queries in campaign '{campaign_name}'."
            db.add(Alert(user_id=user_id, campaign_id=campaign_id, type="irrelevant_queries", message=message))
            created += 1
        db.commit()
        removed = clear_old_alerts(db, days=90)
        return {"triggered_rules": triggered, "new_irrelevant_alerts": created, "removed_old_alerts": removed}


@shared_task(name="app.tasks.jobs.sync_keyword_positions_task")
def sync_keyword_positions_task() -> dict[str, int]:
    """
    Placeholder for keyword position checks.
    A production deployment can replace this with parser/API integration.
    """
    with SessionLocal() as db:
        watchlists = db.execute(
            select(WatchlistKeyword).join(MPAccount, MPAccount.id == WatchlistKeyword.account_id).where(MPAccount.is_active.is_(True))
        ).scalars().all()
        inserted = 0
        for watch in watchlists:
            exists = db.execute(
                select(KeywordPosition).where(KeywordPosition.watchlist_id == watch.id, KeywordPosition.date == date.today())
            ).scalar_one_or_none()
            if exists:
                continue
            position = KeywordPosition(
                watchlist_id=watch.id,
                date=date.today(),
                organic_position=None,
                paid_position=None,
            )
            db.add(position)
            inserted += 1
        db.commit()
        return {"positions_synced": inserted}


@shared_task(name="app.tasks.jobs.send_daily_summary_task")
def send_daily_summary_task() -> dict[str, int]:
    with SessionLocal() as db:
        summary = daily_summary_by_user(db)
        users = db.execute(select(User)).scalars().all()

        sent = 0
        for user in users:
            payload = summary.get(user.id)
            if not payload:
                continue
            text = (
                "Daily ads summary:\n"
                f"Spend: {payload['spend']:.2f}\n"
                f"Orders: {int(payload['orders'])}\n"
                f"DRR: {payload['drr']:.2f}%"
            )
            _send_telegram_message(user.telegram_id, text)
            sent += 1
        return {"summaries_sent": sent}
