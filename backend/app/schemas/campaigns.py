from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import Marketplace


class CampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int
    external_id: str
    name: str
    type: str | None
    status: str | None
    daily_budget: float | None
    auto_minus_enabled: bool = False
    marketplace: Marketplace | None = None
    impressions: int = 0
    clicks: int = 0
    ctr: float = 0.0
    cpc: float = 0.0
    orders: int = 0
    cr: float = 0.0
    revenue: float = 0.0
    drr: float = 0.0
    spend: float = 0.0
    created_at: datetime
    updated_at: datetime


class CampaignStatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    impressions: int
    clicks: int
    spend: float
    orders: int
    revenue: float
    ctr: float
    cpc: float
    cpo: float
    drr: float
    cr: float = 0.0


class DashboardMetricsOut(BaseModel):
    impressions: int = 0
    clicks: int = 0
    ctr: float = 0.0
    cpc: float = 0.0
    orders: int = 0
    cr: float = 0.0
    revenue: float = 0.0
    drr: float = 0.0
    spend: float = 0.0


class DashboardTrendPointOut(BaseModel):
    date: date
    impressions: int
    clicks: int
    orders: int
    spend: float


class DashboardIrrelevantAlertOut(BaseModel):
    count: int = 0
    wasted_per_day: float = 0.0
    wasted_per_month: float = 0.0


class DashboardSummaryOut(BaseModel):
    spend_today: float
    spend_week: float
    spend_month: float
    total_orders: int
    avg_drr: float
    wb_spend: float
    ozon_spend: float
    last_synced_at: datetime | None
    totals: DashboardMetricsOut = Field(default_factory=DashboardMetricsOut)
    trend: list[DashboardTrendPointOut] = Field(default_factory=list)
    diagnostics: list[str] = Field(default_factory=list)
    irrelevant_alert: DashboardIrrelevantAlertOut = Field(default_factory=DashboardIrrelevantAlertOut)


class CampaignAutoMinusToggleRequest(BaseModel):
    enabled: bool


class CampaignAutoMinusToggleOut(BaseModel):
    campaign_id: int
    auto_minus_enabled: bool
