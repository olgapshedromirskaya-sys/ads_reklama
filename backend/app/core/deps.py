from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import decode_access_token
from app.models.entities import BotUser, BotUserRole, User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    bot_user = db.execute(
        select(BotUser).where(BotUser.telegram_id == user.telegram_id, BotUser.is_active.is_(True))
    ).scalar_one_or_none()
    if bot_user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")
    return user


def get_current_bot_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> BotUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    payload = decode_access_token(credentials.credentials)

    telegram_id_raw = payload.get("telegram_id")
    if telegram_id_raw is None:
        user_id_raw = payload.get("user_id")
        if user_id_raw is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        user = db.get(User, int(user_id_raw))
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        telegram_id = int(user.telegram_id)
    else:
        telegram_id = int(telegram_id_raw)

    bot_user = db.execute(
        select(BotUser).where(BotUser.telegram_id == telegram_id, BotUser.is_active.is_(True))
    ).scalar_one_or_none()
    if bot_user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")
    return bot_user


def get_scope_user_id(user: User) -> int:
    return int(user.owner_id or user.id)


def require_admin_or_director(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {UserRole.DIRECTOR, UserRole.ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")
    return current_user


def require_director(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ только для руководителя")
    if current_user.owner_id is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Сотрудники не могут управлять командой")
    return current_user


def require_bot_owner(current_bot_user: BotUser = Depends(get_current_bot_user)) -> BotUser:
    if current_bot_user.role != BotUserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ только для руководителя")
    return current_bot_user
