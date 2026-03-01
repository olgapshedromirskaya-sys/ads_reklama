from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    campaign_id: int | None
    type: str
    message: str
    is_read: bool
    created_at: datetime


class AlertReadRequest(BaseModel):
    alert_ids: list[int]
