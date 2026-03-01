from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import Marketplace, UserRole


class TelegramLoginRequest(BaseModel):
    init_data: str = Field(..., min_length=1, description="Telegram WebApp initData")


class TelegramUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int
    username: str | None
    role: UserRole
    owner_id: int | None
    created_at: datetime


class AuthUserOut(BaseModel):
    id: int
    telegram_id: int
    username: str | None
    role: UserRole
    owner_id: int | None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserOut


class AccountCreate(BaseModel):
    marketplace: Marketplace
    name: str
    api_token: str | None = None
    client_id: str | None = None
    api_key: str | None = None


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    marketplace: Marketplace
    name: str
    is_active: bool
    needs_reconnection: bool
    last_synced_at: datetime | None
    created_at: datetime


class TeamMemberCreate(BaseModel):
    telegram_id: int
    username: str | None = None
    role: UserRole


class TeamMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int
    username: str | None
    role: UserRole
    owner_id: int | None
    created_at: datetime
