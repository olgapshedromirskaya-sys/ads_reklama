from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class CampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int
    external_id: str
    name: str
    type: str | None
    status: str | None
    daily_budget: float | None
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


class CampaignSummaryOut(BaseModel):
    campaign_id: int
    campaign_name: str
    spend_today: float
    spend_week: float
    spend_month: float
    orders_today: int
    avg_drr: float


class DashboardSummaryOut(BaseModel):
    spend_today: float
    spend_week: float
    spend_month: float
    total_orders: int
    avg_drr: float
    wb_spend: float
    ozon_spend: float
    last_synced_at: datetime | None
