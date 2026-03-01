"""add campaign auto minus toggle

Revision ID: 20260301_0002
Revises: 20260301_0001
Create Date: 2026-03-01 00:02:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260301_0002"
down_revision: Union[str, None] = "20260301_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "campaigns",
        sa.Column("auto_minus_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )


def downgrade() -> None:
    op.drop_column("campaigns", "auto_minus_enabled")
