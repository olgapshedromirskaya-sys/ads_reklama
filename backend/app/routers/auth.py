import json
from json import JSONDecodeError
from typing import Any
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, validate_telegram_init_data
from app.models.entities import MPAccount, User
from app.schemas.auth import AccountCreate, AccountOut, AuthResponse, AuthUserOut, TelegramLoginRequest, TelegramUserOut
from app.services.sync import refresh_user_data, run_async

router = APIRouter(prefix="/auth", tags=["auth"])


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


@router.post("/telegram", response_model=AuthResponse)
def telegram_login(payload: TelegramLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    _extract_init_data_user_payload(payload.init_data)
    identity = validate_telegram_init_data(payload.init_data)
    user = db.execute(select(User).where(User.telegram_id == identity.telegram_id)).scalar_one_or_none()
    if user is None:
        user = User(telegram_id=identity.telegram_id, username=identity.username)
        db.add(user)
    else:
        user.username = identity.username
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "telegram_id": user.telegram_id})
    response_user = AuthUserOut(id=user.id, telegram_id=user.telegram_id, username=user.username)
    return AuthResponse(access_token=token, user=response_user)


@router.get("/me", response_model=TelegramUserOut)
def me(current_user: User = Depends(get_current_user)) -> TelegramUserOut:
    return TelegramUserOut.model_validate(current_user)


@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[MPAccount]:
    accounts = db.execute(select(MPAccount).where(MPAccount.user_id == current_user.id)).scalars().all()
    return accounts


@router.post("/accounts", response_model=AccountOut)
def connect_account(
    payload: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MPAccount:
    if payload.marketplace.value == "wb" and not payload.api_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WB account requires api_token")
    if payload.marketplace.value == "ozon" and (not payload.client_id or not payload.api_key):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ozon account requires client_id and api_key")

    account = MPAccount(
        user_id=current_user.id,
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    account = db.execute(
        select(MPAccount).where(MPAccount.id == account_id, MPAccount.user_id == current_user.id)
    ).scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    result = run_async(refresh_user_data(current_user.id, db))
    return result
