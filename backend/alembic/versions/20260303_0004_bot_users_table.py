"""add bot users access control table

Revision ID: 20260303_0004
Revises: 20260301_0003
Create Date: 2026-03-03 00:10:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260303_0004"
down_revision: Union[str, None] = "20260301_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


bot_user_role_enum = sa.Enum("owner", "admin", "manager", name="bot_user_role_enum")


def upgrade() -> None:
    bind = op.get_bind()
    bot_user_role_enum.create(bind, checkfirst=True)

    op.create_table(
        "bot_users",
        sa.Column("telegram_id", sa.BigInteger(), primary_key=True),
        sa.Column("username", sa.String(length=255), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", bot_user_role_enum, nullable=False),
        sa.Column("added_by", sa.BigInteger(), nullable=True),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.ForeignKeyConstraint(["added_by"], ["bot_users.telegram_id"], name="fk_bot_users_added_by_bot_users", ondelete="SET NULL"),
    )
    op.create_index("ix_bot_users_added_by", "bot_users", ["added_by"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_bot_users_added_by", table_name="bot_users")
    op.drop_table("bot_users")

    bind = op.get_bind()
    bot_user_role_enum.drop(bind, checkfirst=True)
