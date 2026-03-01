from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.entities import BudgetAction, BudgetRuleType


class BudgetRuleCreate(BaseModel):
    campaign_id: int
    rule_type: BudgetRuleType
    threshold: float
    action: BudgetAction
    is_active: bool = True


class BudgetRuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    rule_type: BudgetRuleType
    threshold: float
    action: BudgetAction
    is_active: bool
    created_at: datetime
