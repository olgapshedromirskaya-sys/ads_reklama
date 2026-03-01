from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_scope_user_id, require_admin_or_director
from app.models.entities import KeywordPosition, MPAccount, User, WatchlistKeyword
from app.schemas.keywords import KeywordPositionOut, WatchlistKeywordCreate, WatchlistKeywordOut

router = APIRouter(prefix="/keywords", tags=["keywords"])


@router.get("/watchlist", response_model=list[WatchlistKeywordOut])
def list_watchlist(
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> list[WatchlistKeyword]:
    scope_user_id = get_scope_user_id(current_user)
    return db.execute(
        select(WatchlistKeyword)
        .join(MPAccount, MPAccount.id == WatchlistKeyword.account_id)
        .where(MPAccount.user_id == scope_user_id)
        .order_by(WatchlistKeyword.id.desc())
    ).scalars().all()


@router.post("/watchlist", response_model=WatchlistKeywordOut)
def create_watchlist(
    payload: WatchlistKeywordCreate,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> WatchlistKeyword:
    scope_user_id = get_scope_user_id(current_user)
    account = db.execute(
        select(MPAccount).where(MPAccount.id == payload.account_id, MPAccount.user_id == scope_user_id)
    ).scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    item = WatchlistKeyword(
        account_id=payload.account_id,
        article_id=payload.article_id,
        keyword=payload.keyword,
        target_position=payload.target_position,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/watchlist/{watchlist_id}")
def delete_watchlist(
    watchlist_id: int,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    scope_user_id = get_scope_user_id(current_user)
    watchlist = db.execute(
        select(WatchlistKeyword)
        .join(MPAccount, MPAccount.id == WatchlistKeyword.account_id)
        .where(WatchlistKeyword.id == watchlist_id, MPAccount.user_id == scope_user_id)
    ).scalar_one_or_none()
    if watchlist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist keyword not found")
    db.delete(watchlist)
    db.commit()
    return {"status": "deleted"}


@router.get("/{watchlist_id}/positions", response_model=list[KeywordPositionOut])
def list_keyword_positions(
    watchlist_id: int,
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> list[KeywordPosition]:
    scope_user_id = get_scope_user_id(current_user)
    watchlist = db.execute(
        select(WatchlistKeyword)
        .join(MPAccount, MPAccount.id == WatchlistKeyword.account_id)
        .where(WatchlistKeyword.id == watchlist_id, MPAccount.user_id == scope_user_id)
    ).scalar_one_or_none()
    if watchlist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist keyword not found")
    date_from = date.today() - timedelta(days=days - 1)
    return db.execute(
        select(KeywordPosition)
        .where(KeywordPosition.watchlist_id == watchlist_id, KeywordPosition.date >= date_from)
        .order_by(KeywordPosition.date.asc())
    ).scalars().all()
