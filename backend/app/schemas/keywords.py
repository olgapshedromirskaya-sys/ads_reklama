from datetime import date

from pydantic import BaseModel, ConfigDict


class WatchlistKeywordCreate(BaseModel):
    account_id: int
    article_id: str
    keyword: str
    target_position: int | None = None


class WatchlistKeywordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int
    article_id: str
    keyword: str
    target_position: int | None


class KeywordPositionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    watchlist_id: int
    date: date
    organic_position: int | None
    paid_position: int | None
