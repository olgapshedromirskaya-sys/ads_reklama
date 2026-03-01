from __future__ import annotations

import io
from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from openpyxl import Workbook
from sqlalchemy import and_, asc, desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.entities import Campaign, CampaignStat, MPAccount, Marketplace, MinusWord, QueryLabel, QueryLabelStatus, SearchQuery, User
from app.schemas.queries import (
    AutoCleanupAllOut,
    AutoCleanupQueryOut,
    AutoCleanupResultOut,
    BulkLabelUpdateRequest,
    BulkLabelUpdateResponse,
    MinusWordsApplyResponse,
    MinusWordOut,
    MinusWordsGenerateRequest,
    QueryTrendPoint,
    SearchQueryOut,
)
from app.services.auto_cleanup import AutoCleanupResult, auto_cleanup_campaign, auto_cleanup_user_campaigns
from app.services.morphology import (
    auto_classify_campaign_queries,
    estimate_not_relevant_daily_spend,
    regenerate_minus_words_for_campaign,
    upsert_minus_words,
)
from app.services.ozon_api import OzonApiClient
from app.services.relevancy import classify_query_default
from app.services.sync import run_async
from app.services.wb_api import WBApiClient

router = APIRouter(prefix="/queries", tags=["queries"])


def _calc_rate(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _assert_campaign_access(db: Session, user_id: int, campaign_id: int) -> Campaign:
    campaign = db.execute(
        select(Campaign)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(Campaign.id == campaign_id, MPAccount.user_id == user_id)
        .options(joinedload(Campaign.account))
    ).scalar_one_or_none()
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


def _upsert_minus_words(db: Session, campaign_id: int, queries: list[str]) -> list[str]:
    return upsert_minus_words(db, campaign_id, queries)


def _format_rub(amount: float) -> str:
    rounded = round(amount, 2)
    if rounded.is_integer():
        return f"{int(rounded):,}".replace(",", " ") + "₽"
    return f"{rounded:,.2f}".replace(",", " ") + "₽"


def _campaign_avg_order_values(db: Session, campaign_ids: list[int]) -> dict[int, float]:
    if not campaign_ids:
        return {}
    rows = db.execute(
        select(
            CampaignStat.campaign_id,
            func.coalesce(func.sum(CampaignStat.revenue), 0),
            func.coalesce(func.sum(CampaignStat.orders), 0),
        )
        .where(CampaignStat.campaign_id.in_(campaign_ids))
        .group_by(CampaignStat.campaign_id)
    ).all()
    result: dict[int, float] = {}
    for campaign_id, revenue, orders in rows:
        orders_int = int(orders or 0)
        if orders_int > 0:
            result[int(campaign_id)] = float(revenue or 0.0) / orders_int
        else:
            result[int(campaign_id)] = 0.0
    return result


def _to_auto_cleanup_response(result: AutoCleanupResult) -> AutoCleanupResultOut:
    return AutoCleanupResultOut(
        campaign_id=result.campaign_id,
        campaign_name=result.campaign_name,
        auto_minus_enabled=result.auto_minus_enabled,
        irrelevant_found=result.irrelevant_found,
        minus_words=result.minus_words,
        budget_wasted=result.budget_wasted,
        budget_saved=result.budget_saved,
        auto_applied=result.auto_applied,
        apply_failed=result.apply_failed,
        queries=[
            AutoCleanupQueryOut(
                query=item.query,
                impressions=item.impressions,
                clicks=item.clicks,
                ctr=item.ctr,
                cpc=item.cpc,
                orders=item.orders,
                spend=item.spend,
                revenue=item.revenue,
                drr=item.drr,
                rules_triggered=item.rules_triggered,
            )
            for item in result.queries
        ],
    )


@router.get("/", response_model=list[SearchQueryOut])
def list_queries(
    q: str | None = Query(default=None, description="search query text"),
    marketplace: Marketplace | None = Query(default=None),
    campaign_id: int | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    ctr_min: float | None = Query(default=None),
    ctr_max: float | None = Query(default=None),
    spend_min: float | None = Query(default=None),
    spend_max: float | None = Query(default=None),
    has_orders: bool | None = Query(default=None),
    sort_by: str = Query(default="date"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=500, ge=1, le=5000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SearchQueryOut]:
    label_join = and_(QueryLabel.campaign_id == SearchQuery.campaign_id, QueryLabel.query == SearchQuery.query)
    stmt = (
        select(SearchQuery, QueryLabel.label, Campaign.name, MPAccount.marketplace)
        .join(Campaign, Campaign.id == SearchQuery.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .outerjoin(QueryLabel, label_join)
        .where(MPAccount.user_id == current_user.id)
    )

    if q:
        stmt = stmt.where(SearchQuery.query.ilike(f"%{q}%"))
    if marketplace:
        stmt = stmt.where(MPAccount.marketplace == marketplace)
    if campaign_id:
        stmt = stmt.where(SearchQuery.campaign_id == campaign_id)
    if date_from:
        stmt = stmt.where(SearchQuery.date >= date_from)
    if date_to:
        stmt = stmt.where(SearchQuery.date <= date_to)
    if ctr_min is not None:
        stmt = stmt.where(SearchQuery.ctr >= ctr_min)
    if ctr_max is not None:
        stmt = stmt.where(SearchQuery.ctr <= ctr_max)
    if spend_min is not None:
        stmt = stmt.where(SearchQuery.spend >= spend_min)
    if spend_max is not None:
        stmt = stmt.where(SearchQuery.spend <= spend_max)
    if has_orders is True:
        stmt = stmt.where(SearchQuery.orders > 0)
    if has_orders is False:
        stmt = stmt.where(SearchQuery.orders == 0)

    sort_map = {
        "query": SearchQuery.query,
        "impressions": SearchQuery.impressions,
        "clicks": SearchQuery.clicks,
        "ctr": SearchQuery.ctr,
        "cpc": SearchQuery.cpc,
        "spend": SearchQuery.spend,
        "orders": SearchQuery.orders,
        "cpo": SearchQuery.cpo,
        "date": SearchQuery.date,
    }
    computed_sort_fields = {"cr", "revenue", "drr"}
    sort_column = sort_map.get(sort_by, SearchQuery.date)
    stmt = stmt.order_by(desc(sort_column) if sort_dir == "desc" else asc(sort_column))
    if sort_by not in computed_sort_fields:
        stmt = stmt.limit(limit)

    rows = db.execute(stmt).all()
    campaign_ids = sorted({int(row_query.campaign_id) for row_query, *_ in rows})
    avg_order_values = _campaign_avg_order_values(db, campaign_ids)

    result: list[SearchQueryOut] = []
    for row_query, row_label, campaign_name, row_marketplace in rows:
        avg_order_value = avg_order_values.get(int(row_query.campaign_id), 0.0)
        cr = _calc_rate(row_query.orders * 100, row_query.clicks)
        revenue = avg_order_value * row_query.orders
        drr = _calc_rate(float(row_query.spend) * 100, revenue) if revenue > 0 else (999.0 if float(row_query.spend) > 0 else 0.0)
        hint = classify_query_default(
            ctr=row_query.ctr,
            impressions=row_query.impressions,
            orders=row_query.orders,
            spend=float(row_query.spend),
            clicks=row_query.clicks,
        )
        result.append(
            SearchQueryOut(
                id=row_query.id,
                campaign_id=row_query.campaign_id,
                query=row_query.query,
                date=row_query.date,
                impressions=row_query.impressions,
                clicks=row_query.clicks,
                spend=float(row_query.spend),
                orders=row_query.orders,
                ctr=row_query.ctr,
                cpc=row_query.cpc,
                cpo=row_query.cpo,
                cr=cr,
                revenue=revenue,
                drr=drr,
                relevance_hint=hint,
                label=row_label or hint,
                campaign_name=campaign_name,
                marketplace=row_marketplace.value if row_marketplace else None,
            )
        )

    if sort_by in computed_sort_fields:
        reverse = sort_dir != "asc"
        result.sort(key=lambda item: getattr(item, sort_by), reverse=reverse)
        result = result[:limit]
    return result


@router.post("/labels/bulk", response_model=BulkLabelUpdateResponse)
def update_labels_bulk(
    payload: BulkLabelUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BulkLabelUpdateResponse:
    _assert_campaign_access(db, current_user.id, payload.campaign_id)
    generated_source_queries: list[str] = []

    for item in payload.updates:
        label = db.execute(
            select(QueryLabel).where(QueryLabel.campaign_id == payload.campaign_id, QueryLabel.query == item.query)
        ).scalar_one_or_none()
        if label is None:
            label = QueryLabel(campaign_id=payload.campaign_id, query=item.query)
            db.add(label)
        label.label = item.label
        label.labeled_by = current_user.id
        label.labeled_at = datetime.now(UTC)

        if item.label == QueryLabelStatus.NOT_RELEVANT:
            generated_source_queries.append(item.query)
    db.commit()

    roots = _upsert_minus_words(db, payload.campaign_id, generated_source_queries)
    return BulkLabelUpdateResponse(updated_count=len(payload.updates), generated_minus_words=roots)


@router.post("/minus-words/generate", response_model=list[str])
def generate_minus_words_for_campaign(
    payload: MinusWordsGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[str]:
    _assert_campaign_access(db, current_user.id, payload.campaign_id)
    selected_queries = payload.queries
    if not selected_queries:
        auto_classify_campaign_queries(db, payload.campaign_id)
        return regenerate_minus_words_for_campaign(db, payload.campaign_id)
    return _upsert_minus_words(db, payload.campaign_id, selected_queries)


@router.post("/minus-words/{campaign_id}/apply", response_model=MinusWordsApplyResponse)
async def apply_minus_words(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MinusWordsApplyResponse:
    campaign = _assert_campaign_access(db, current_user.id, campaign_id)
    auto_classify_campaign_queries(db, campaign.id)
    generated_minus_words = regenerate_minus_words_for_campaign(db, campaign.id)
    saved_budget_estimate = estimate_not_relevant_daily_spend(db, campaign.id)
    if not generated_minus_words:
        return MinusWordsApplyResponse(applied=0, failed=0, saved_budget_estimate=_format_rub(saved_budget_estimate))

    account = campaign.account
    if account is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Campaign account relation is missing")

    applied = 0
    failed = 0
    try:
        if account.marketplace == Marketplace.WB:
            if not account.api_token:
                failed = len(generated_minus_words)
            else:
                async with WBApiClient(account.api_token, account.id) as wb:
                    await wb.add_minus_phrases(campaign.external_id, generated_minus_words)
                applied = len(generated_minus_words)
        elif account.marketplace == Marketplace.OZON:
            if not account.client_id or not account.api_key:
                failed = len(generated_minus_words)
            else:
                async with OzonApiClient(account.client_id, account.api_key) as ozon:
                    await ozon.add_negative_keywords(campaign.external_id, generated_minus_words)
                applied = len(generated_minus_words)
        else:
            failed = len(generated_minus_words)
    except Exception:
        failed = len(generated_minus_words)
        applied = 0

    return MinusWordsApplyResponse(
        applied=applied,
        failed=failed,
        saved_budget_estimate=_format_rub(saved_budget_estimate),
    )


@router.post("/auto-cleanup/{campaign_id}", response_model=AutoCleanupResultOut)
def run_auto_cleanup_for_campaign(
    campaign_id: int,
    days: int = Query(default=7, ge=1, le=60),
    apply_now: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AutoCleanupResultOut:
    campaign = _assert_campaign_access(db, current_user.id, campaign_id)
    result = run_async(auto_cleanup_campaign(db, campaign, days=days, force_auto_apply=apply_now))
    return _to_auto_cleanup_response(result)


@router.post("/auto-cleanup/all", response_model=AutoCleanupAllOut)
def run_auto_cleanup_for_all_campaigns(
    days: int = Query(default=7, ge=1, le=60),
    apply_now: bool = Query(default=False),
    only_auto_enabled: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AutoCleanupAllOut:
    results = run_async(
        auto_cleanup_user_campaigns(
            db,
            current_user.id,
            days=days,
            only_auto_minus_enabled=only_auto_enabled,
            force_auto_apply=apply_now,
        )
    )
    response_items = [_to_auto_cleanup_response(item) for item in results]
    return AutoCleanupAllOut(
        campaigns_processed=len(response_items),
        irrelevant_found=sum(item.irrelevant_found for item in response_items),
        budget_wasted=round(sum(item.budget_wasted for item in response_items), 2),
        budget_saved=round(sum(item.budget_saved for item in response_items), 2),
        results=response_items,
    )


@router.get("/minus-words/{campaign_id}", response_model=list[MinusWordOut])
def list_minus_words(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MinusWord]:
    _assert_campaign_access(db, current_user.id, campaign_id)
    return db.execute(select(MinusWord).where(MinusWord.campaign_id == campaign_id).order_by(MinusWord.word_root)).scalars().all()


@router.get("/trends", response_model=list[QueryTrendPoint])
def query_trends(
    query: str,
    days: int = Query(default=30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[QueryTrendPoint]:
    date_from = date.today() - timedelta(days=days - 1)
    rows = db.execute(
        select(
            SearchQuery.date,
            func.sum(SearchQuery.impressions),
            func.sum(SearchQuery.clicks),
            func.sum(SearchQuery.spend),
        )
        .join(Campaign, Campaign.id == SearchQuery.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(
            MPAccount.user_id == current_user.id,
            SearchQuery.date >= date_from,
            SearchQuery.query.ilike(f"%{query}%"),
        )
        .group_by(SearchQuery.date)
        .order_by(SearchQuery.date.asc())
    ).all()

    return [
        QueryTrendPoint(date=row_date, impressions=int(impressions or 0), clicks=int(clicks or 0), spend=float(spend or 0))
        for row_date, impressions, clicks, spend in rows
    ]


@router.get("/export.xlsx")
def export_queries_xlsx(
    campaign_id: int | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    stmt = (
        select(SearchQuery, Campaign.name, MPAccount.marketplace, QueryLabel.label)
        .join(Campaign, Campaign.id == SearchQuery.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .outerjoin(QueryLabel, and_(QueryLabel.campaign_id == SearchQuery.campaign_id, QueryLabel.query == SearchQuery.query))
        .where(MPAccount.user_id == current_user.id)
        .order_by(SearchQuery.date.desc())
    )
    if campaign_id:
        stmt = stmt.where(SearchQuery.campaign_id == campaign_id)
    rows = db.execute(stmt).all()
    campaign_ids = sorted({int(search_query.campaign_id) for search_query, *_ in rows})
    avg_order_values = _campaign_avg_order_values(db, campaign_ids)

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Запросы"
    worksheet.append(
        [
            "Дата",
            "Маркетплейс",
            "Кампания",
            "Запрос",
            "Показы",
            "Клики",
            "CTR",
            "CPC",
            "Заказы",
            "CR",
            "Расход",
            "Выручка",
            "ДРР",
            "CPO",
            "Метка",
        ]
    )
    for search_query, campaign_name, row_marketplace, row_label in rows:
        avg_order_value = avg_order_values.get(int(search_query.campaign_id), 0.0)
        revenue = avg_order_value * search_query.orders
        drr = _calc_rate(float(search_query.spend) * 100, revenue) if revenue > 0 else (999.0 if float(search_query.spend) > 0 else 0.0)
        cr = _calc_rate(search_query.orders * 100, search_query.clicks)
        worksheet.append(
            [
                search_query.date.isoformat(),
                row_marketplace.value if row_marketplace else "",
                campaign_name,
                search_query.query,
                search_query.impressions,
                search_query.clicks,
                round(search_query.ctr, 4),
                round(search_query.cpc, 4),
                search_query.orders,
                round(cr, 4),
                float(search_query.spend),
                round(revenue, 2),
                round(drr, 4),
                round(search_query.cpo, 4),
                (
                    row_label.value
                    if row_label
                    else classify_query_default(
                        search_query.ctr,
                        search_query.impressions,
                        search_query.orders,
                        float(search_query.spend),
                        search_query.clicks,
                    ).value
                ),
            ]
        )

    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=queries_export.xlsx"},
    )
