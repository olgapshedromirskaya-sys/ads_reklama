import json
import logging
from json import JSONDecodeError
from typing import Any
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.database import AsyncSessionAdapter, get_db as get_async_db
from app.core.deps import (
    get_current_bot_user,
    get_current_user,
    get_scope_user_id,
    require_admin_or_director,
    require_director,
)
from app.core.security import create_access_token, validate_telegram_init_data
from app.models.entities import BotUser, BotUserRole, MPAccount, User, UserRole
from app.schemas.auth import (
    AccountCreate,
    AccountOut,
    AuthResponse,
    TeamMemberCreate,
    TeamMemberOut,
    TelegramLoginRequest,
    TelegramUserOut,
)
from app.services.bot_users import build_full_name, ensure_internal_user_for_bot_user, get_active_bot_user, get_active_owner_bot_user
from app.services.sync import refresh_user_data, run_async

router = APIRouter(prefix="/auth", tags=["auth"])
setup_router = APIRouter(tags=["auth"])
logger = logging.getLogger(__name__)
OWNER_TELEGRAM_ID = 545972485


def _extract_init_data_user_payload(init_data: str) -> dict[str, Any]:
    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    raw_user = pairs.get("user")
    if not raw_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram initData: missing user payload",
        )

    try:
        user_payload = json.loads(raw_user)
    except JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram initData: malformed user payload",
        ) from exc

    if not isinstance(user_payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram initData: user payload must be an object",
        )

    user_id = user_payload.get("id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram initData: missing user.id",
        )

    try:
        int(user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Telegram initData: user.id must be an integer",
        ) from exc

    return user_payload


def _can_fallback_to_init_data_user(exc: HTTPException) -> bool:
    signature_error_details = {"Invalid Telegram signature", "Missing hash in initData"}
    return exc.status_code == status.HTTP_401_UNAUTHORIZED and str(exc.detail) in signature_error_details


def _serialize_auth_user(bot_user: BotUser) -> dict[str, Any]:
    return {
        "id": int(bot_user.telegram_id),
        "telegram_id": int(bot_user.telegram_id),
        "username": bot_user.username,
        "name": bot_user.full_name,
        "role": bot_user.role.value,
    }


@setup_router.get("/setup/owner")
@setup_router.post("/setup/owner")
async def setup_owner(db: AsyncSessionAdapter = Depends(get_async_db)) -> dict[str, str]:
    # Always ensure 545972485 is owner
    await db.execute(
        text(
            """
            INSERT INTO bot_users (telegram_id, username, full_name, role, is_active, added_at)
            VALUES (545972485, 'owner', 'Руководитель', 'owner', true, NOW())
            ON CONFLICT (telegram_id) DO UPDATE SET role = 'owner', is_active = true
            """
        )
    )
    await db.commit()
    return {"status": "ok", "message": "Owner 545972485 set successfully"}


@setup_router.get("/setup/cleanup")
@setup_router.post("/setup/cleanup")
async def cleanup_unauthorized_users(db: AsyncSessionAdapter = Depends(get_async_db)) -> dict:
    """
    Деактивирует всех пользователей кроме owner (545972485).
    Гарантирует что owner активен и имеет роль owner.
    Вызывать однократно для очистки БД.
    """
    # Деактивируем всех незарегистрированных (не owner)
    result_deactivate = await db.execute(
        text(
            """
            UPDATE bot_users
            SET is_active = false
            WHERE telegram_id != 545972485
              AND role != 'owner'
            """
        )
    )
    # Убедимся что owner активен
    await db.execute(
        text(
            """
            INSERT INTO bot_users (telegram_id, username, full_name, role, is_active, added_at)
            VALUES (545972485, 'owner', 'Руководитель', 'owner', true, NOW())
            ON CONFLICT (telegram_id) DO UPDATE SET role = 'owner', is_active = true
            """
        )
    )
    # Показываем кто остался активным
    result_active = await db.execute(
        text("SELECT telegram_id, username, role, is_active FROM bot_users WHERE is_active = true ORDER BY added_at")
    )
    active_users = [
        {"telegram_id": row[0], "username": row[1], "role": row[2], "is_active": row[3]}
        for row in result_active.fetchall()
    ]
    await db.commit()
    deactivated_count = result_deactivate.rowcount if hasattr(result_deactivate, "rowcount") else 0
    return {
        "status": "ok",
        "deactivated": deactivated_count,
        "active_users": active_users,
        "message": f"Очищено {deactivated_count} незарегистрированных пользователей. Активных: {len(active_users)}",
    }


@router.post("/telegram", response_model=AuthResponse)
def telegram_login(payload: TelegramLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    logger.info("Received /api/auth/telegram request init_data_length=%d", len(payload.init_data))
    init_data_user = _extract_init_data_user_payload(payload.init_data)
    telegram_id = int(init_data_user["id"])
    username = init_data_user.get("username")
    first_name = init_data_user.get("first_name")
    last_name = init_data_user.get("last_name")

    try:
        identity = validate_telegram_init_data(payload.init_data)
        telegram_id = identity.telegram_id
        username = identity.username
        first_name = identity.first_name
        last_name = identity.last_name
    except HTTPException as exc:
        if _can_fallback_to_init_data_user(exc):
            logger.warning(
                "Telegram initData validation failed (%s); using unverified initData user payload fallback",
                exc.detail,
            )
        else:
            raise

    hardcoded_owner = telegram_id == OWNER_TELEGRAM_ID
    role: BotUserRole
    bot_user = get_active_bot_user(db, telegram_id)
    if hardcoded_owner:
        role = BotUserRole.OWNER
        if bot_user is None:
            bot_user = db.get(BotUser, telegram_id)
            if bot_user is None:
                bot_user = BotUser(
                    telegram_id=telegram_id,
                    username=username,
                    full_name=build_full_name(first_name, last_name, username, telegram_id),
                    role=BotUserRole.OWNER,
                    is_active=True,
                )
                db.add(bot_user)
            else:
                bot_user.is_active = True
        bot_user.role = BotUserRole.OWNER
    else:
        if bot_user is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")
        role = bot_user.role

    bot_user.username = username or bot_user.username
    bot_user.full_name = build_full_name(first_name, last_name, bot_user.username, telegram_id)

    owner_bot_user = bot_user if role == BotUserRole.OWNER else get_active_owner_bot_user(db)
    user = ensure_internal_user_for_bot_user(db, bot_user, owner_bot_user=owner_bot_user)
    db.commit()
    db.refresh(user)
    db.refresh(bot_user)

    token = create_access_token({"user_id": user.id, "telegram_id": user.telegram_id, "role": role.value})
    response_payload = {
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_auth_user(bot_user),
    }
    auth_response = AuthResponse.model_validate(response_payload)
    logger.info("Returning /api/auth/telegram response JSON: %s", auth_response.model_dump_json())
    return auth_response


@router.get("/me", response_model=TelegramUserOut)
def me(
    current_user: User = Depends(get_current_user),
    current_bot_user: BotUser = Depends(get_current_bot_user),
) -> TelegramUserOut:
    del current_user
    return TelegramUserOut.model_validate(_serialize_auth_user(current_bot_user))


@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(current_user: User = Depends(require_admin_or_director), db: Session = Depends(get_db)) -> list[MPAccount]:
    scope_user_id = get_scope_user_id(current_user)
    accounts = db.execute(select(MPAccount).where(MPAccount.user_id == scope_user_id)).scalars().all()
    return accounts


@router.post("/accounts", response_model=AccountOut)
def connect_account(
    payload: AccountCreate,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> MPAccount:
    if payload.marketplace.value == "wb" and not payload.api_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WB account requires api_token")
    if payload.marketplace.value == "ozon" and (not payload.client_id or not payload.api_key):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ozon account requires client_id and api_key")

    scope_user_id = get_scope_user_id(current_user)
    account = MPAccount(
        user_id=scope_user_id,
        marketplace=payload.marketplace,
        name=payload.name,
        api_token=payload.api_token,
        client_id=payload.client_id,
        api_key=payload.api_key,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.post("/accounts/{account_id}/refresh")
def refresh_data(
    account_id: int,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    scope_user_id = get_scope_user_id(current_user)
    account = db.execute(
        select(MPAccount).where(MPAccount.id == account_id, MPAccount.user_id == scope_user_id)
    ).scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    result = run_async(refresh_user_data(scope_user_id, db))
    return result


@router.get("/team/members", response_model=list[TeamMemberOut])
def list_team_members(
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> list[User]:
    scope_user_id = get_scope_user_id(current_user)
    return db.execute(select(User).where(User.owner_id == scope_user_id).order_by(User.created_at.asc())).scalars().all()


@router.post("/team/members", response_model=TeamMemberOut)
def add_team_member(
    payload: TeamMemberCreate,
    current_user: User = Depends(require_director),
    db: Session = Depends(get_db),
) -> User:
    if payload.role == UserRole.DIRECTOR:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Для сотрудника выберите admin или manager")
    if payload.telegram_id == current_user.telegram_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя назначить себя сотрудником")

    member = db.execute(select(User).where(User.telegram_id == payload.telegram_id)).scalar_one_or_none()
    if member is None:
        member = User(
            telegram_id=payload.telegram_id,
            username=payload.username,
            role=payload.role,
            owner_id=current_user.id,
        )
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    if member.owner_id is not None and member.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Сотрудник уже привязан к другому руководителю",
        )
    member.owner_id = current_user.id
    member.role = payload.role
    if payload.username:
        member.username = payload.username
    db.commit()
    db.refresh(member)
    return member


@router.delete("/team/members/{member_id}")
def remove_team_member(
    member_id: int,
    current_user: User = Depends(require_director),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    member = db.execute(
        select(User).where(
            User.id == member_id,
            User.owner_id == current_user.id,
        )
    ).scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сотрудник не найден")
    member.owner_id = None
    member.role = UserRole.DIRECTOR
    db.commit()
    return {"removed": 1}
