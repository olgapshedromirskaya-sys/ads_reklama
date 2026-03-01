from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.entities import Campaign, CampaignStat, MPAccount, Marketplace, User
from app.schemas.campaigns import CampaignOut, CampaignStatOut, DashboardSummaryOut
from app.services.sync import pause_or_resume_campaign, run_async

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/", response_model=list[CampaignOut])
def list_campaigns(
    marketplace: Marketplace | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Campaign]:
    query = (
        select(Campaign)
        .join(MPAccount, Campaign.account_id == MPAccount.id)
        .where(MPAccount.user_id == current_user.id)
        .order_by(Campaign.updated_at.desc())
    )
    if marketplace:
        query = query.where(MPAccount.marketplace == marketplace)
    if status_filter:
        query = query.where(Campaign.status == status_filter)
    return db.execute(query).scalars().all()


def _get_campaign_for_user(db: Session, user_id: int, campaign_id: int) -> Campaign:
    campaign = db.execute(
        select(Campaign)
        .join(MPAccount, Campaign.account_id == MPAccount.id)
        .where(Campaign.id == campaign_id, MPAccount.user_id == user_id)
        .options(joinedload(Campaign.account))
    ).scalar_one_or_none()
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


@router.get("/{campaign_id}", response_model=CampaignOut)
def campaign_detail(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Campaign:
    return _get_campaign_for_user(db, current_user.id, campaign_id)


@router.get("/{campaign_id}/stats", response_model=list[CampaignStatOut])
def campaign_stats(
    campaign_id: int,
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CampaignStat]:
    campaign = _get_campaign_for_user(db, current_user.id, campaign_id)
    date_from = date.today() - timedelta(days=days - 1)
    stats = db.execute(
        select(CampaignStat)
        .where(and_(CampaignStat.campaign_id == campaign.id, CampaignStat.date >= date_from))
        .order_by(CampaignStat.date.asc())
    ).scalars().all()
    return stats


@router.post("/{campaign_id}/pause")
def pause_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    campaign = _get_campaign_for_user(db, current_user.id, campaign_id)
    run_async(pause_or_resume_campaign(campaign, pause=True))
    campaign.status = "paused"
    db.commit()
    return {"status": "paused"}


@router.post("/{campaign_id}/resume")
def resume_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    campaign = _get_campaign_for_user(db, current_user.id, campaign_id)
    run_async(pause_or_resume_campaign(campaign, pause=False))
    campaign.status = "active"
    db.commit()
    return {"status": "active"}


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardSummaryOut:
    today = date.today()
    week_start = today - timedelta(days=6)
    month_start = today.replace(day=1)

    base_stats = (
        select(
            func.coalesce(func.sum(CampaignStat.spend), 0).label("spend"),
            func.coalesce(func.sum(CampaignStat.orders), 0).label("orders"),
            func.coalesce(func.sum(CampaignStat.revenue), 0).label("revenue"),
        )
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.user_id == current_user.id)
    )

    spend_today, orders_today, revenue_today = db.execute(base_stats.where(CampaignStat.date == today)).one()
    spend_week, _, _ = db.execute(base_stats.where(CampaignStat.date >= week_start)).one()
    spend_month, _, _ = db.execute(base_stats.where(CampaignStat.date >= month_start)).one()

    wb_spend = db.execute(
        select(func.coalesce(func.sum(CampaignStat.spend), 0))
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.user_id == current_user.id, MPAccount.marketplace == Marketplace.WB, CampaignStat.date == today)
    ).scalar_one()
    ozon_spend = db.execute(
        select(func.coalesce(func.sum(CampaignStat.spend), 0))
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.user_id == current_user.id, MPAccount.marketplace == Marketplace.OZON, CampaignStat.date == today)
    ).scalar_one()

    avg_drr = (float(spend_today) / float(revenue_today) * 100) if float(revenue_today) > 0 else 0.0
    last_synced_at = db.execute(
        select(func.max(MPAccount.last_synced_at)).where(MPAccount.user_id == current_user.id)
    ).scalar_one()

    return DashboardSummaryOut(
        spend_today=float(spend_today),
        spend_week=float(spend_week),
        spend_month=float(spend_month),
        total_orders=int(orders_today or 0),
        avg_drr=avg_drr,
        wb_spend=float(wb_spend),
        ozon_spend=float(ozon_spend),
        last_synced_at=last_synced_at,
    )
