from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import BotUser, BotUserRole, User, UserRole


def build_full_name(
    first_name: str | None,
    last_name: str | None,
    username: str | None,
    telegram_id: int,
) -> str:
    parts = [part.strip() for part in [first_name, last_name] if part and part.strip()]
    if parts:
        return " ".join(parts)
    if username:
        return username
    return f"User {telegram_id}"


def map_bot_role_to_user_role(role: BotUserRole) -> UserRole:
    if role == BotUserRole.OWNER:
        return UserRole.DIRECTOR
    if role == BotUserRole.ADMIN:
        return UserRole.ADMIN
    return UserRole.MANAGER


def get_active_bot_user(db: Session, telegram_id: int) -> BotUser | None:
    return db.execute(
        select(BotUser).where(BotUser.telegram_id == telegram_id, BotUser.is_active.is_(True))
    ).scalar_one_or_none()


def get_active_owner_bot_user(db: Session) -> BotUser | None:
    return db.execute(
        select(BotUser)
        .where(BotUser.role == BotUserRole.OWNER, BotUser.is_active.is_(True))
        .order_by(BotUser.added_at.asc())
    ).scalars().first()


def _ensure_owner_internal_user(db: Session, owner_bot_user: BotUser) -> User:
    owner_user = db.execute(select(User).where(User.telegram_id == owner_bot_user.telegram_id)).scalar_one_or_none()
    if owner_user is None:
        owner_user = User(
            telegram_id=owner_bot_user.telegram_id,
            username=owner_bot_user.username,
            role=UserRole.DIRECTOR,
            owner_id=None,
        )
        db.add(owner_user)
        db.flush()
    else:
        owner_user.username = owner_bot_user.username
        owner_user.role = UserRole.DIRECTOR
        owner_user.owner_id = None
        db.flush()
    return owner_user


def ensure_internal_user_for_bot_user(
    db: Session,
    bot_user: BotUser,
    *,
    owner_bot_user: BotUser | None = None,
) -> User:
    user = db.execute(select(User).where(User.telegram_id == bot_user.telegram_id)).scalar_one_or_none()
    if user is None:
        user = User(telegram_id=bot_user.telegram_id, username=bot_user.username)
        db.add(user)
        db.flush()

    user.username = bot_user.username
    user.role = map_bot_role_to_user_role(bot_user.role)

    if bot_user.role == BotUserRole.OWNER:
        user.owner_id = None
        db.flush()
        return user

    owner_ref = owner_bot_user or get_active_owner_bot_user(db)
    if owner_ref is None:
        user.owner_id = None
        db.flush()
        return user

    owner_user = _ensure_owner_internal_user(db, owner_ref)
    user.owner_id = owner_user.id
    db.flush()
    return user
