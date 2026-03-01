"""initial schema

Revision ID: 20260301_0001
Revises:
Create Date: 2026-03-01 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260301_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


marketplace_enum = sa.Enum("wb", "ozon", name="marketplace_enum")
query_label_status_enum = sa.Enum("relevant", "not_relevant", "pending", name="query_label_status_enum")
budget_rule_type_enum = sa.Enum(
    "daily_budget",
    "weekly_budget",
    "monthly_budget",
    "drr",
    "ctr_drop",
    name="budget_rule_type_enum",
)
budget_action_enum = sa.Enum("alert", "pause_campaign", name="budget_action_enum")


def upgrade() -> None:
    bind = op.get_bind()
    marketplace_enum.create(bind, checkfirst=True)
    query_label_status_enum.create(bind, checkfirst=True)
    budget_rule_type_enum.create(bind, checkfirst=True)
    budget_action_enum.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("telegram_id", sa.BigInteger(), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("telegram_id"),
    )
    op.create_index("ix_users_telegram_id", "users", ["telegram_id"], unique=True)

    op.create_table(
        "mp_accounts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("marketplace", marketplace_enum, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("api_token", sa.String(length=1024), nullable=True),
        sa.Column("client_id", sa.String(length=255), nullable=True),
        sa.Column("api_key", sa.String(length=1024), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("needs_reconnection", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_mp_accounts_user_id", "mp_accounts", ["user_id"], unique=False)

    op.create_table(
        "campaigns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("mp_accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("external_id", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=True),
        sa.Column("daily_budget", sa.Numeric(14, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("account_id", "external_id", name="uq_campaign_account_external"),
    )
    op.create_index("ix_campaigns_account_id", "campaigns", ["account_id"], unique=False)

    op.create_table(
        "campaign_stats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("spend", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("orders", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("revenue", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("ctr", sa.Float(), nullable=False, server_default="0"),
        sa.Column("cpc", sa.Float(), nullable=False, server_default="0"),
        sa.Column("cpo", sa.Float(), nullable=False, server_default="0"),
        sa.Column("drr", sa.Float(), nullable=False, server_default="0"),
        sa.UniqueConstraint("campaign_id", "date", name="uq_campaign_stat_date"),
    )
    op.create_index("ix_campaign_stats_campaign_id", "campaign_stats", ["campaign_id"], unique=False)

    op.create_table(
        "search_queries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("spend", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("orders", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("ctr", sa.Float(), nullable=False, server_default="0"),
        sa.Column("cpc", sa.Float(), nullable=False, server_default="0"),
        sa.Column("cpo", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("campaign_id", "query", "date", name="uq_search_query_campaign_query_date"),
    )
    op.create_index("ix_search_queries_campaign_id", "search_queries", ["campaign_id"], unique=False)
    op.create_index("ix_search_queries_query", "search_queries", ["query"], unique=False)

    op.create_table(
        "query_labels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("label", query_label_status_enum, nullable=False, server_default="pending"),
        sa.Column("labeled_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("labeled_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("campaign_id", "query", name="uq_query_label_campaign_query"),
    )
    op.create_index("ix_query_labels_campaign_id", "query_labels", ["campaign_id"], unique=False)

    op.create_table(
        "minus_words",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("word_root", sa.String(length=255), nullable=False),
        sa.Column("source_queries", sa.JSON(), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("campaign_id", "word_root", name="uq_minus_word_campaign_root"),
    )
    op.create_index("ix_minus_words_campaign_id", "minus_words", ["campaign_id"], unique=False)

    op.create_table(
        "watchlist_keywords",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("mp_accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("article_id", sa.String(length=255), nullable=False),
        sa.Column("keyword", sa.String(length=255), nullable=False),
        sa.Column("target_position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_watchlist_keywords_account_id", "watchlist_keywords", ["account_id"], unique=False)

    op.create_table(
        "keyword_positions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("watchlist_id", sa.Integer(), sa.ForeignKey("watchlist_keywords.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("organic_position", sa.Integer(), nullable=True),
        sa.Column("paid_position", sa.Integer(), nullable=True),
        sa.UniqueConstraint("watchlist_id", "date", name="uq_keyword_position_watchlist_date"),
    )
    op.create_index("ix_keyword_positions_watchlist_id", "keyword_positions", ["watchlist_id"], unique=False)

    op.create_table(
        "budget_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rule_type", budget_rule_type_enum, nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column("action", budget_action_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_budget_rules_campaign_id", "budget_rules", ["campaign_id"], unique=False)

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_alerts_user_id", "alerts", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alerts_user_id", table_name="alerts")
    op.drop_table("alerts")

    op.drop_index("ix_budget_rules_campaign_id", table_name="budget_rules")
    op.drop_table("budget_rules")

    op.drop_index("ix_keyword_positions_watchlist_id", table_name="keyword_positions")
    op.drop_table("keyword_positions")

    op.drop_index("ix_watchlist_keywords_account_id", table_name="watchlist_keywords")
    op.drop_table("watchlist_keywords")

    op.drop_index("ix_minus_words_campaign_id", table_name="minus_words")
    op.drop_table("minus_words")

    op.drop_index("ix_query_labels_campaign_id", table_name="query_labels")
    op.drop_table("query_labels")

    op.drop_index("ix_search_queries_query", table_name="search_queries")
    op.drop_index("ix_search_queries_campaign_id", table_name="search_queries")
    op.drop_table("search_queries")

    op.drop_index("ix_campaign_stats_campaign_id", table_name="campaign_stats")
    op.drop_table("campaign_stats")

    op.drop_index("ix_campaigns_account_id", table_name="campaigns")
    op.drop_table("campaigns")

    op.drop_index("ix_mp_accounts_user_id", table_name="mp_accounts")
    op.drop_table("mp_accounts")

    op.drop_index("ix_users_telegram_id", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    budget_action_enum.drop(bind, checkfirst=True)
    budget_rule_type_enum.drop(bind, checkfirst=True)
    query_label_status_enum.drop(bind, checkfirst=True)
    marketplace_enum.drop(bind, checkfirst=True)
