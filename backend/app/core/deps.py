from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import decode_access_token
from app.models.entities import User, UserRole

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
    return user


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
