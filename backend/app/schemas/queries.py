from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import QueryLabelStatus


class SearchQueryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    query: str
    date: date
    impressions: int
    clicks: int
    spend: float
    orders: int
    ctr: float
    cpc: float
    cpo: float
    relevance_hint: QueryLabelStatus | None = None
    label: QueryLabelStatus | None = None
    campaign_name: str | None = None
    marketplace: str | None = None


class LabelUpdate(BaseModel):
    query: str
    label: QueryLabelStatus


class BulkLabelUpdateRequest(BaseModel):
    campaign_id: int
    updates: list[LabelUpdate]


class BulkLabelUpdateResponse(BaseModel):
    updated_count: int
    generated_minus_words: list[str] = Field(default_factory=list)


class MinusWordsGenerateRequest(BaseModel):
    campaign_id: int
    queries: list[str] | None = None


class MinusWordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    word_root: str
    source_queries: list[str] | dict
    added_at: datetime


class QueryTrendPoint(BaseModel):
    date: date
    impressions: int
    clicks: int
    spend: float
