from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user, get_scope_user_id, require_admin_or_director
from app.models.entities import Campaign, CampaignStat, MPAccount, Marketplace, QueryLabel, QueryLabelStatus, SearchQuery, User
from app.schemas.campaigns import (
    CampaignAutoMinusToggleOut,
    CampaignAutoMinusToggleRequest,
    CampaignOut,
    CampaignStatOut,
    DashboardIrrelevantAlertOut,
    DashboardMetricsOut,
    DashboardSummaryOut,
    DashboardTrendPointOut,
)
from app.services.sync import pause_or_resume_campaign, run_async

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def _calc_rate(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _format_rub(amount: float) -> str:
    rounded = int(round(amount))
    return f"{rounded:,}₽"


def _build_metrics(impressions: int, clicks: int, spend: float, orders: int, revenue: float) -> DashboardMetricsOut:
    ctr = _calc_rate(clicks * 100, impressions)
    cpc = _calc_rate(spend, clicks)
    cr = _calc_rate(orders * 100, clicks)
    drr = _calc_rate(spend * 100, revenue)
    return DashboardMetricsOut(
        impressions=int(impressions or 0),
        clicks=int(clicks or 0),
        ctr=ctr,
        cpc=cpc,
        orders=int(orders or 0),
        cr=cr,
        revenue=float(revenue or 0.0),
        drr=drr,
        spend=float(spend or 0.0),
    )


def _collect_campaign_metrics(db: Session, user_id: int, days: int = 30) -> dict[int, tuple[DashboardMetricsOut, Marketplace | None]]:
    date_from = date.today() - timedelta(days=max(1, days) - 1)
    rows = db.execute(
        select(
            Campaign.id,
            MPAccount.marketplace,
            func.coalesce(func.sum(CampaignStat.impressions), 0),
            func.coalesce(func.sum(CampaignStat.clicks), 0),
            func.coalesce(func.sum(CampaignStat.spend), 0),
            func.coalesce(func.sum(CampaignStat.orders), 0),
            func.coalesce(func.sum(CampaignStat.revenue), 0),
        )
        .join(MPAccount, Campaign.account_id == MPAccount.id)
        .outerjoin(
            CampaignStat,
            and_(
                CampaignStat.campaign_id == Campaign.id,
                CampaignStat.date >= date_from,
            ),
        )
        .where(MPAccount.user_id == user_id)
        .group_by(Campaign.id, MPAccount.marketplace)
    ).all()

    result: dict[int, tuple[DashboardMetricsOut, Marketplace | None]] = {}
    for campaign_id, marketplace, impressions, clicks, spend, orders, revenue in rows:
        result[int(campaign_id)] = (
            _build_metrics(
                impressions=int(impressions or 0),
                clicks=int(clicks or 0),
                spend=float(spend or 0.0),
                orders=int(orders or 0),
                revenue=float(revenue or 0.0),
            ),
            marketplace,
        )
    return result


def _campaign_to_out(campaign: Campaign, metrics: DashboardMetricsOut | None, marketplace: Marketplace | None) -> CampaignOut:
    metrics_data = metrics or DashboardMetricsOut()
    return CampaignOut(
        id=campaign.id,
        account_id=campaign.account_id,
        external_id=campaign.external_id,
        name=campaign.name,
        type=campaign.type,
        status=campaign.status,
        daily_budget=float(campaign.daily_budget) if campaign.daily_budget is not None else None,
        auto_minus_enabled=campaign.auto_minus_enabled,
        marketplace=marketplace,
        impressions=metrics_data.impressions,
        clicks=metrics_data.clicks,
        ctr=metrics_data.ctr,
        cpc=metrics_data.cpc,
        orders=metrics_data.orders,
        cr=metrics_data.cr,
        revenue=metrics_data.revenue,
        drr=metrics_data.drr,
        spend=metrics_data.spend,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


@router.get("/", response_model=list[CampaignOut])
def list_campaigns(
    marketplace: Marketplace | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CampaignOut]:
    scope_user_id = get_scope_user_id(current_user)
    query = (
        select(Campaign)
        .join(MPAccount, Campaign.account_id == MPAccount.id)
        .where(MPAccount.user_id == scope_user_id)
        .options(joinedload(Campaign.account))
        .order_by(Campaign.updated_at.desc())
    )
    if marketplace:
        query = query.where(MPAccount.marketplace == marketplace)
    if status_filter:
        query = query.where(Campaign.status == status_filter)
    campaigns = db.execute(query).scalars().all()
    metrics_map = _collect_campaign_metrics(db, scope_user_id, days=days)

    result: list[CampaignOut] = []
    for campaign in campaigns:
        metrics, mp = metrics_map.get(campaign.id, (DashboardMetricsOut(), campaign.account.marketplace if campaign.account else None))
        result.append(_campaign_to_out(campaign, metrics, mp))
    return result


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


def _resolve_dashboard_period(period: str, date_from: date | None, date_to: date | None) -> tuple[date, date]:
    today = date.today()
    if period == "day":
        return today, today
    if period == "month":
        return today.replace(day=1), today
    if period == "custom":
        if date_from is None or date_to is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Для custom периода укажите date_from и date_to",
            )
        if date_from > date_to:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="date_from не может быть больше date_to",
            )
        if (date_to - date_from).days > 180:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Диапазон периода не должен превышать 180 дней",
            )
        return date_from, date_to
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="period должен быть одним из: day, month, custom",
    )


@router.get("/{campaign_id}", response_model=CampaignOut)
def campaign_detail(
    campaign_id: int,
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CampaignOut:
    scope_user_id = get_scope_user_id(current_user)
    campaign = _get_campaign_for_user(db, scope_user_id, campaign_id)
    metrics_map = _collect_campaign_metrics(db, scope_user_id, days=days)
    metrics, mp = metrics_map.get(campaign.id, (DashboardMetricsOut(), campaign.account.marketplace if campaign.account else None))
    return _campaign_to_out(campaign, metrics, mp)


@router.get("/{campaign_id}/stats", response_model=list[CampaignStatOut])
def campaign_stats(
    campaign_id: int,
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CampaignStatOut]:
    scope_user_id = get_scope_user_id(current_user)
    campaign = _get_campaign_for_user(db, scope_user_id, campaign_id)
    date_from = date.today() - timedelta(days=days - 1)
    stats = db.execute(
        select(CampaignStat)
        .where(and_(CampaignStat.campaign_id == campaign.id, CampaignStat.date >= date_from))
        .order_by(CampaignStat.date.asc())
    ).scalars().all()
    return [
        CampaignStatOut(
            date=item.date,
            impressions=item.impressions,
            clicks=item.clicks,
            spend=float(item.spend),
            orders=item.orders,
            revenue=float(item.revenue),
            ctr=item.ctr,
            cpc=item.cpc,
            cpo=item.cpo,
            drr=item.drr,
            cr=_calc_rate(item.orders * 100, item.clicks),
        )
        for item in stats
    ]


@router.post("/{campaign_id}/pause")
def pause_campaign(
    campaign_id: int,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    scope_user_id = get_scope_user_id(current_user)
    campaign = _get_campaign_for_user(db, scope_user_id, campaign_id)
    run_async(pause_or_resume_campaign(campaign, pause=True))
    campaign.status = "paused"
    db.commit()
    return {"status": "paused"}


@router.post("/{campaign_id}/resume")
def resume_campaign(
    campaign_id: int,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    scope_user_id = get_scope_user_id(current_user)
    campaign = _get_campaign_for_user(db, scope_user_id, campaign_id)
    run_async(pause_or_resume_campaign(campaign, pause=False))
    campaign.status = "active"
    db.commit()
    return {"status": "active"}


@router.post("/{campaign_id}/auto-minus", response_model=CampaignAutoMinusToggleOut)
def toggle_campaign_auto_minus(
    campaign_id: int,
    payload: CampaignAutoMinusToggleRequest,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> CampaignAutoMinusToggleOut:
    scope_user_id = get_scope_user_id(current_user)
    campaign = _get_campaign_for_user(db, scope_user_id, campaign_id)
    campaign.auto_minus_enabled = payload.enabled
    campaign.updated_at = datetime.now(UTC)
    db.commit()
    return CampaignAutoMinusToggleOut(campaign_id=campaign.id, auto_minus_enabled=campaign.auto_minus_enabled)


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(
    marketplace: Marketplace | None = Query(default=None),
    period: str = Query(default="month"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardSummaryOut:
    scope_user_id = get_scope_user_id(current_user)
    today = date.today()
    week_start = today - timedelta(days=6)
    month_start = today.replace(day=1)
    range_from, range_to = _resolve_dashboard_period(period, date_from, date_to)
    account_filters = [MPAccount.user_id == scope_user_id]
    if marketplace:
        account_filters.append(MPAccount.marketplace == marketplace)

    base_stats = (
        select(
            func.coalesce(func.sum(CampaignStat.impressions), 0).label("impressions"),
            func.coalesce(func.sum(CampaignStat.clicks), 0).label("clicks"),
            func.coalesce(func.sum(CampaignStat.spend), 0).label("spend"),
            func.coalesce(func.sum(CampaignStat.orders), 0).label("orders"),
            func.coalesce(func.sum(CampaignStat.revenue), 0).label("revenue"),
        )
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(*account_filters)
    )

    _, _, spend_today, _, _ = db.execute(base_stats.where(CampaignStat.date == today)).one()
    _, _, spend_week, _, _ = db.execute(base_stats.where(CampaignStat.date >= week_start)).one()
    _, _, spend_month, _, _ = db.execute(base_stats.where(CampaignStat.date >= month_start)).one()
    impressions_total, clicks_total, spend_total, orders_total, revenue_total = db.execute(
        base_stats.where(CampaignStat.date >= range_from, CampaignStat.date <= range_to)
    ).one()

    if marketplace == Marketplace.WB:
        wb_spend = float(spend_total or 0.0)
        ozon_spend = 0.0
    elif marketplace == Marketplace.OZON:
        wb_spend = 0.0
        ozon_spend = float(spend_total or 0.0)
    else:
        wb_spend = db.execute(
            select(func.coalesce(func.sum(CampaignStat.spend), 0))
            .join(Campaign, Campaign.id == CampaignStat.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(
                MPAccount.user_id == scope_user_id,
                MPAccount.marketplace == Marketplace.WB,
                CampaignStat.date >= range_from,
                CampaignStat.date <= range_to,
            )
        ).scalar_one()
        ozon_spend = db.execute(
            select(func.coalesce(func.sum(CampaignStat.spend), 0))
            .join(Campaign, Campaign.id == CampaignStat.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(
                MPAccount.user_id == scope_user_id,
                MPAccount.marketplace == Marketplace.OZON,
                CampaignStat.date >= range_from,
                CampaignStat.date <= range_to,
            )
        ).scalar_one()

    avg_drr = _calc_rate(float(spend_total) * 100, float(revenue_total))
    sync_filters = [MPAccount.user_id == scope_user_id]
    if marketplace:
        sync_filters.append(MPAccount.marketplace == marketplace)
    last_synced_at = db.execute(select(func.max(MPAccount.last_synced_at)).where(*sync_filters)).scalar_one()

    trend_rows = db.execute(
        select(
            CampaignStat.date,
            func.coalesce(func.sum(CampaignStat.impressions), 0),
            func.coalesce(func.sum(CampaignStat.clicks), 0),
            func.coalesce(func.sum(CampaignStat.orders), 0),
            func.coalesce(func.sum(CampaignStat.spend), 0),
        )
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(*account_filters, CampaignStat.date >= range_from, CampaignStat.date <= range_to)
        .group_by(CampaignStat.date)
        .order_by(CampaignStat.date.asc())
    ).all()
    trend = [
        DashboardTrendPointOut(
            date=row_date,
            impressions=int(impressions or 0),
            clicks=int(clicks or 0),
            orders=int(orders or 0),
            spend=float(spend or 0.0),
        )
        for row_date, impressions, clicks, orders, spend in trend_rows
    ]

    campaign_metrics_rows = db.execute(
        select(
            Campaign.id,
            func.coalesce(func.sum(CampaignStat.impressions), 0),
            func.coalesce(func.sum(CampaignStat.clicks), 0),
            func.coalesce(func.sum(CampaignStat.spend), 0),
            func.coalesce(func.sum(CampaignStat.revenue), 0),
        )
        .join(Campaign, Campaign.id == CampaignStat.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(*account_filters, CampaignStat.date >= range_from, CampaignStat.date <= range_to)
        .group_by(Campaign.id)
    ).all()
    high_drr_campaigns = 0
    low_ctr_campaigns = 0
    for _, impressions, clicks, spend, revenue in campaign_metrics_rows:
        ctr = _calc_rate(float(clicks or 0) * 100, float(impressions or 0))
        drr = _calc_rate(float(spend or 0) * 100, float(revenue or 0))
        if drr > 35:
            high_drr_campaigns += 1
        if impressions and ctr < 1:
            low_ctr_campaigns += 1

    latest_query_date = db.execute(
        select(func.max(SearchQuery.date))
        .join(Campaign, Campaign.id == SearchQuery.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(*account_filters)
    ).scalar_one_or_none()

    zero_sales_queries = 0
    zero_sales_wasted = 0.0
    irrelevant_count = 0
    irrelevant_spend = 0.0
    if latest_query_date is not None:
        latest_query_rows = db.execute(
            select(
                SearchQuery.campaign_id,
                SearchQuery.query,
                func.coalesce(func.sum(SearchQuery.orders), 0),
                func.coalesce(func.sum(SearchQuery.spend), 0),
            )
            .join(Campaign, Campaign.id == SearchQuery.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(*account_filters, SearchQuery.date == latest_query_date)
            .group_by(SearchQuery.campaign_id, SearchQuery.query)
        ).all()
        for _, _, orders, spend in latest_query_rows:
            spend_float = float(spend or 0.0)
            orders_int = int(orders or 0)
            if orders_int == 0 and spend_float > 0:
                zero_sales_queries += 1
                zero_sales_wasted += spend_float

        irrelevant_rows = db.execute(
            select(
                SearchQuery.campaign_id,
                SearchQuery.query,
                func.coalesce(func.sum(SearchQuery.spend), 0),
            )
            .join(Campaign, Campaign.id == SearchQuery.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .join(
                QueryLabel,
                and_(
                    QueryLabel.campaign_id == SearchQuery.campaign_id,
                    QueryLabel.query == SearchQuery.query,
                ),
            )
            .where(
                *account_filters,
                SearchQuery.date == latest_query_date,
                QueryLabel.label == QueryLabelStatus.NOT_RELEVANT,
            )
            .group_by(SearchQuery.campaign_id, SearchQuery.query)
        ).all()
        irrelevant_count = len(irrelevant_rows)
        irrelevant_spend = sum(float(spend or 0.0) for _, _, spend in irrelevant_rows)

    diagnostics = [
        f"❌ {high_drr_campaigns} кампаний с ДРР > 35%",
        f"❌ {zero_sales_queries} ключей с 0 продажами сливают {_format_rub(zero_sales_wasted)}/день",
        f"❌ CTR ниже 1% в {low_ctr_campaigns} кампаниях — проблема с карточкой",
    ]

    return DashboardSummaryOut(
        spend_today=float(spend_today),
        spend_week=float(spend_week),
        spend_month=float(spend_month),
        total_orders=int(orders_total or 0),
        avg_drr=avg_drr,
        wb_spend=float(wb_spend),
        ozon_spend=float(ozon_spend),
        last_synced_at=last_synced_at,
        totals=_build_metrics(
            impressions=int(impressions_total or 0),
            clicks=int(clicks_total or 0),
            spend=float(spend_total or 0.0),
            orders=int(orders_total or 0),
            revenue=float(revenue_total or 0.0),
        ),
        trend=trend,
        diagnostics=diagnostics,
        irrelevant_alert=DashboardIrrelevantAlertOut(
            count=irrelevant_count,
            wasted_per_day=round(irrelevant_spend, 2),
            wasted_per_month=round(irrelevant_spend * 30, 2),
        ),
    )
