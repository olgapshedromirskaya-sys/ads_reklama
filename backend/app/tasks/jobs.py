from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Any

import httpx
from celery import shared_task
from sqlalchemy import select

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.entities import Campaign, KeywordPosition, MPAccount, User, WatchlistKeyword
from app.services.auto_cleanup import auto_cleanup_all_campaigns
from app.services.sync import (
    check_budget_rules,
    clear_old_alerts,
    daily_summary_by_user,
    run_budget_protection_alerts_for_account,
    run_async,
    sync_all_accounts_campaigns,
    sync_all_campaign_stats,
    sync_all_search_queries,
)


def _format_rub(amount: float) -> str:
    return f"{int(round(amount)):,}₽"


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
        accounts = db.execute(select(MPAccount).where(MPAccount.is_active.is_(True))).scalars().all()
        created = 0
        for account in accounts:
            created += run_budget_protection_alerts_for_account(account, db)
        removed = clear_old_alerts(db, days=90)
        return {"triggered_rules": triggered, "budget_protection_alerts": created, "removed_old_alerts": removed}


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


@shared_task(name="app.tasks.jobs.auto_cleanup_task")
def auto_cleanup_task() -> dict[str, int | float]:
    with SessionLocal() as db:
        results = run_async(
            auto_cleanup_all_campaigns(
                db,
                days=7,
                only_auto_minus_enabled=True,
                force_auto_apply=True,
            )
        )
        if not results:
            return {
                "campaigns_processed": 0,
                "irrelevant_removed": 0,
                "budget_saved_per_day": 0.0,
                "notifications_sent": 0,
            }

        campaign_to_user = {
            int(campaign_id): int(user_id)
            for campaign_id, user_id in db.execute(
                select(Campaign.id, MPAccount.user_id).join(MPAccount, MPAccount.id == Campaign.account_id)
            ).all()
        }
        by_user: dict[int, dict[str, float]] = defaultdict(
            lambda: {
                "campaigns_processed": 0.0,
                "irrelevant_removed": 0.0,
                "budget_saved_per_day": 0.0,
            }
        )

        for item in results:
            user_id = campaign_to_user.get(item.campaign_id)
            if user_id is None:
                continue
            by_user[user_id]["campaigns_processed"] += 1
            by_user[user_id]["irrelevant_removed"] += item.irrelevant_found
            by_user[user_id]["budget_saved_per_day"] += item.budget_saved

        users = db.execute(select(User).where(User.id.in_(list(by_user.keys())))).scalars().all()
        sent = 0
        for user in users:
            payload = by_user.get(user.id)
            if not payload:
                continue
            text = (
                "🤖 Авто-минусовка завершена\n"
                f"Кампаний обработано: {int(payload['campaigns_processed'])}\n"
                f"Нерелевантных ключей удалено: {int(payload['irrelevant_removed'])}\n"
                f"Экономия бюджета: ~{_format_rub(payload['budget_saved_per_day'])}/день"
            )
            _send_telegram_message(user.telegram_id, text)
            sent += 1

        return {
            "campaigns_processed": int(sum(payload["campaigns_processed"] for payload in by_user.values())),
            "irrelevant_removed": int(sum(payload["irrelevant_removed"] for payload in by_user.values())),
            "budget_saved_per_day": round(sum(payload["budget_saved_per_day"] for payload in by_user.values()), 2),
            "notifications_sent": sent,
        }
