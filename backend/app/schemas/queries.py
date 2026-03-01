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
    cr: float = 0.0
    revenue: float = 0.0
    drr: float = 0.0
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


class MinusWordsApplyResponse(BaseModel):
    applied: int
    failed: int
    saved_budget_estimate: str


class QueryTrendPoint(BaseModel):
    date: date
    impressions: int
    clicks: int
    spend: float


class AutoCleanupQueryOut(BaseModel):
    query: str
    impressions: int
    clicks: int
    ctr: float
    cpc: float
    orders: int
    spend: float
    revenue: float
    drr: float
    rules_triggered: list[str] = Field(default_factory=list)


class AutoCleanupResultOut(BaseModel):
    campaign_id: int
    campaign_name: str
    auto_minus_enabled: bool
    irrelevant_found: int
    minus_words: list[str] = Field(default_factory=list)
    budget_wasted: float
    budget_saved: float
    auto_applied: bool
    apply_failed: int = 0
    queries: list[AutoCleanupQueryOut] = Field(default_factory=list)


class AutoCleanupAllOut(BaseModel):
    campaigns_processed: int
    irrelevant_found: int
    budget_wasted: float
    budget_saved: float
    results: list[AutoCleanupResultOut] = Field(default_factory=list)
