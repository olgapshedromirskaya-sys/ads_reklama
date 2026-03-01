from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    project_name: str = "MP Ads Manager"
    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"

    database_url: str = "postgresql+psycopg://mp_ads:mp_ads@db:5432/mp_ads"
    redis_url: str = "redis://redis:6379/0"

    secret_key: str = Field(default="change_me", min_length=8)
    telegram_bot_token: str = ""
    webapp_url: str = "http://localhost:8080"
    backend_url: str = "http://backend:8000"
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "https://ads-reklama-frontend.onrender.com",
            "https://web.telegram.org",
            "*",
        ]
    )

    wb_api_base_url: str = "https://advert-api.wildberries.ru"
    ozon_api_base_url: str = "https://performance.ozon.ru"

    api_prefix: str = "/api"
    access_token_expire_hours: int = 24
    telegram_auth_max_age_seconds: int = 60 * 60 * 24

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_allowed_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
