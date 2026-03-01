from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("mp_ads_manager", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    timezone="UTC",
    enable_utc=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    imports=["app.tasks.jobs"],
    beat_schedule={
        "sync-campaign-stats-hourly": {
            "task": "app.tasks.jobs.sync_campaign_stats_task",
            "schedule": crontab(minute=0, hour="*"),
        },
        "sync-search-queries-3h": {
            "task": "app.tasks.jobs.sync_search_queries_task",
            "schedule": crontab(minute=0, hour="*/3"),
        },
        "check-budget-rules-30m": {
            "task": "app.tasks.jobs.check_budget_rules_task",
            "schedule": crontab(minute="*/30"),
        },
        "sync-keyword-positions-6am": {
            "task": "app.tasks.jobs.sync_keyword_positions_task",
            "schedule": crontab(minute=0, hour=6),
        },
        "send-daily-summary-9am": {
            "task": "app.tasks.jobs.send_daily_summary_task",
            "schedule": crontab(minute=0, hour=9),
        },
    },
)
