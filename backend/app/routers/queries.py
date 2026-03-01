from __future__ import annotations

import io
from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from openpyxl import Workbook
from sqlalchemy import and_, asc, desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.entities import Campaign, MPAccount, Marketplace, MinusWord, QueryLabel, QueryLabelStatus, SearchQuery, User
from app.schemas.queries import (
    BulkLabelUpdateRequest,
    BulkLabelUpdateResponse,
    MinusWordsApplyResponse,
    MinusWordOut,
    MinusWordsGenerateRequest,
    QueryTrendPoint,
    SearchQueryOut,
)
from app.services.morphology import (
    auto_classify_campaign_queries,
    estimate_not_relevant_daily_spend,
    regenerate_minus_words_for_campaign,
    upsert_minus_words,
)
from app.services.ozon_api import OzonApiClient
from app.services.relevancy import classify_query_default
from app.services.wb_api import WBApiClient

router = APIRouter(prefix="/queries", tags=["queries"])


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
        "spend": SearchQuery.spend,
        "orders": SearchQuery.orders,
        "cpo": SearchQuery.cpo,
        "date": SearchQuery.date,
    }
    sort_column = sort_map.get(sort_by, SearchQuery.date)
    stmt = stmt.order_by(desc(sort_column) if sort_dir == "desc" else asc(sort_column)).limit(limit)

    rows = db.execute(stmt).all()
    result: list[SearchQueryOut] = []
    for row_query, row_label, campaign_name, row_marketplace in rows:
        hint = classify_query_default(
            ctr=row_query.ctr,
            impressions=row_query.impressions,
            orders=row_query.orders,
            spend=float(row_query.spend),
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
                relevance_hint=hint,
                label=row_label or hint,
                campaign_name=campaign_name,
                marketplace=row_marketplace.value if row_marketplace else None,
            )
        )
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

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Queries"
    worksheet.append(
        [
            "Date",
            "Marketplace",
            "Campaign",
            "Query",
            "Impressions",
            "Clicks",
            "CTR",
            "Spend",
            "Orders",
            "CPC",
            "CPO",
            "Label",
        ]
    )
    for search_query, campaign_name, row_marketplace, row_label in rows:
        worksheet.append(
            [
                search_query.date.isoformat(),
                row_marketplace.value if row_marketplace else "",
                campaign_name,
                search_query.query,
                search_query.impressions,
                search_query.clicks,
                round(search_query.ctr, 4),
                float(search_query.spend),
                search_query.orders,
                round(search_query.cpc, 4),
                round(search_query.cpo, 4),
                (
                    row_label.value
                    if row_label
                    else classify_query_default(
                        search_query.ctr,
                        search_query.impressions,
                        search_query.orders,
                        float(search_query.spend),
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
