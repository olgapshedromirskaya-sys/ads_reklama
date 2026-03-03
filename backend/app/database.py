from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.orm import Session

from app.core.db import SessionLocal


class AsyncSessionAdapter:
    def __init__(self, session: Session) -> None:
        self._session = session

    async def execute(self, *args, **kwargs):
        return self._session.execute(*args, **kwargs)

    async def commit(self) -> None:
        self._session.commit()


@asynccontextmanager
async def get_db() -> AsyncIterator[AsyncSessionAdapter]:
    db = SessionLocal()
    try:
        yield AsyncSessionAdapter(db)
    finally:
        db.close()
