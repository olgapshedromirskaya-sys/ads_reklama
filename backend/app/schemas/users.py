from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.entities import BotUserRole


class EmployeeCreateRequest(BaseModel):
    telegram_id: int
    role: BotUserRole
    username: str | None = None
    full_name: str | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: BotUserRole) -> BotUserRole:
        if value == BotUserRole.OWNER:
            raise ValueError("Роль owner нельзя назначить сотруднику")
        return value


class BotUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    telegram_id: int
    username: str | None
    full_name: str
    role: BotUserRole
    added_by: int | None
    added_at: datetime
    is_active: bool


class RemoveEmployeeResponse(BaseModel):
    removed: int = Field(default=1)
