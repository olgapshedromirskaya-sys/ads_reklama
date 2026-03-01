from __future__ import annotations

import enum
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Marketplace(str, enum.Enum):
    WB = "wb"
    OZON = "ozon"


class QueryLabelStatus(str, enum.Enum):
    RELEVANT = "relevant"
    NOT_RELEVANT = "not_relevant"
    PENDING = "pending"


class BudgetRuleType(str, enum.Enum):
    DAILY_BUDGET = "daily_budget"
    WEEKLY_BUDGET = "weekly_budget"
    MONTHLY_BUDGET = "monthly_budget"
    DRR = "drr"
    CTR_DROP = "ctr_drop"


class BudgetAction(str, enum.Enum):
    ALERT = "alert"
    PAUSE_CAMPAIGN = "pause_campaign"


class UserRole(str, enum.Enum):
    DIRECTOR = "director"
    ADMIN = "admin"
    MANAGER = "manager"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role_enum"), default=UserRole.DIRECTOR, nullable=False)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    accounts: Mapped[list[MPAccount]] = relationship(back_populates="user", cascade="all, delete-orphan")
    alerts: Mapped[list[Alert]] = relationship(back_populates="user", cascade="all, delete-orphan")
    labels: Mapped[list[QueryLabel]] = relationship(back_populates="labeled_by_user")
    owner: Mapped[User | None] = relationship(
        "User",
        remote_side=[id],
        back_populates="team_members",
        foreign_keys=[owner_id],
    )
    team_members: Mapped[list[User]] = relationship(
        "User",
        back_populates="owner",
        foreign_keys=[owner_id],
    )


class MPAccount(Base):
    __tablename__ = "mp_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    marketplace: Mapped[Marketplace] = mapped_column(Enum(Marketplace, name="marketplace_enum"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    api_token: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    client_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    api_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    needs_reconnection: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="accounts")
    campaigns: Mapped[list[Campaign]] = relationship(back_populates="account", cascade="all, delete-orphan")
    watchlist_keywords: Mapped[list[WatchlistKeyword]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


class Campaign(Base):
    __tablename__ = "campaigns"
    __table_args__ = (UniqueConstraint("account_id", "external_id", name="uq_campaign_account_external"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("mp_accounts.id", ondelete="CASCADE"), index=True)
    external_id: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    daily_budget: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    auto_minus_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    account: Mapped[MPAccount] = relationship(back_populates="campaigns")
    stats: Mapped[list[CampaignStat]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    search_queries: Mapped[list[SearchQuery]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    labels: Mapped[list[QueryLabel]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    minus_words: Mapped[list[MinusWord]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    budget_rules: Mapped[list[BudgetRule]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    alerts: Mapped[list[Alert]] = relationship(back_populates="campaign")


class CampaignStat(Base):
    __tablename__ = "campaign_stats"
    __table_args__ = (UniqueConstraint("campaign_id", "date", name="uq_campaign_stat_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    spend: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    ctr: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    cpc: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    cpo: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    drr: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    campaign: Mapped[Campaign] = relationship(back_populates="stats")


class SearchQuery(Base):
    __tablename__ = "search_queries"
    __table_args__ = (
        UniqueConstraint("campaign_id", "query", "date", name="uq_search_query_campaign_query_date"),
        Index("ix_search_queries_query", "query"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    spend: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ctr: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    cpc: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    cpo: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign: Mapped[Campaign] = relationship(back_populates="search_queries")


class QueryLabel(Base):
    __tablename__ = "query_labels"
    __table_args__ = (UniqueConstraint("campaign_id", "query", name="uq_query_label_campaign_query"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    label: Mapped[QueryLabelStatus] = mapped_column(
        Enum(QueryLabelStatus, name="query_label_status_enum"), nullable=False, default=QueryLabelStatus.PENDING
    )
    labeled_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    labeled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    campaign: Mapped[Campaign] = relationship(back_populates="labels")
    labeled_by_user: Mapped[User | None] = relationship(back_populates="labels")


class MinusWord(Base):
    __tablename__ = "minus_words"
    __table_args__ = (UniqueConstraint("campaign_id", "word_root", name="uq_minus_word_campaign_root"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    word_root: Mapped[str] = mapped_column(String(255), nullable=False)
    source_queries: Mapped[list[str] | dict[str, Any]] = mapped_column(JSON, nullable=False, default=list)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign: Mapped[Campaign] = relationship(back_populates="minus_words")


class WatchlistKeyword(Base):
    __tablename__ = "watchlist_keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("mp_accounts.id", ondelete="CASCADE"), index=True)
    article_id: Mapped[str] = mapped_column(String(255), nullable=False)
    keyword: Mapped[str] = mapped_column(String(255), nullable=False)
    target_position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    account: Mapped[MPAccount] = relationship(back_populates="watchlist_keywords")
    positions: Mapped[list[KeywordPosition]] = relationship(back_populates="watchlist", cascade="all, delete-orphan")


class KeywordPosition(Base):
    __tablename__ = "keyword_positions"
    __table_args__ = (UniqueConstraint("watchlist_id", "date", name="uq_keyword_position_watchlist_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    watchlist_id: Mapped[int] = mapped_column(ForeignKey("watchlist_keywords.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    organic_position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    paid_position: Mapped[int | None] = mapped_column(Integer, nullable=True)

    watchlist: Mapped[WatchlistKeyword] = relationship(back_populates="positions")


class BudgetRule(Base):
    __tablename__ = "budget_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    rule_type: Mapped[BudgetRuleType] = mapped_column(Enum(BudgetRuleType, name="budget_rule_type_enum"), nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    action: Mapped[BudgetAction] = mapped_column(Enum(BudgetAction, name="budget_action_enum"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign: Mapped[Campaign] = relationship(back_populates="budget_rules")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="alerts")
    campaign: Mapped[Campaign | None] = relationship(back_populates="alerts")
