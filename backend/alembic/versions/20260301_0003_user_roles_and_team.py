"""add user roles and team ownership

Revision ID: 20260301_0003
Revises: 20260301_0002
Create Date: 2026-03-01 00:30:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260301_0003"
down_revision: Union[str, None] = "20260301_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role_enum = sa.Enum("director", "admin", "manager", name="user_role_enum")


def upgrade() -> None:
    bind = op.get_bind()
    user_role_enum.create(bind, checkfirst=True)

    op.add_column(
        "users",
        sa.Column("role", user_role_enum, nullable=False, server_default=sa.text("'director'")),
    )
    op.add_column(
        "users",
        sa.Column("owner_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_users_owner_id", "users", ["owner_id"], unique=False)
    op.create_foreign_key(
        "fk_users_owner_id_users",
        "users",
        "users",
        ["owner_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_owner_id_users", "users", type_="foreignkey")
    op.drop_index("ix_users_owner_id", table_name="users")
    op.drop_column("users", "owner_id")
    op.drop_column("users", "role")

    bind = op.get_bind()
    user_role_enum.drop(bind, checkfirst=True)
