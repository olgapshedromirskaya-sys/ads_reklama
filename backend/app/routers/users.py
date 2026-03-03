from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_bot_owner
from app.models.entities import BotUser, BotUserRole, User, UserRole
from app.schemas.users import BotUserOut, EmployeeCreateRequest, RemoveEmployeeResponse
from app.services.bot_users import ensure_internal_user_for_bot_user, get_active_owner_bot_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/list", response_model=list[BotUserOut])
def list_bot_users(
    current_owner: BotUser = Depends(require_bot_owner),
    db: Session = Depends(get_db),
) -> list[BotUser]:
    del current_owner
    role_order = case(
        (BotUser.role == BotUserRole.OWNER, 0),
        (BotUser.role == BotUserRole.ADMIN, 1),
        else_=2,
    )
    return db.execute(
        select(BotUser).where(BotUser.is_active.is_(True)).order_by(role_order.asc(), BotUser.added_at.asc())
    ).scalars().all()


@router.post("/add-employee", response_model=BotUserOut)
def add_employee(
    payload: EmployeeCreateRequest,
    current_owner: BotUser = Depends(require_bot_owner),
    db: Session = Depends(get_db),
) -> BotUser:
    if payload.telegram_id == current_owner.telegram_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя добавить себя как сотрудника")

    employee = db.get(BotUser, payload.telegram_id)
    if employee is None:
        employee = BotUser(
            telegram_id=payload.telegram_id,
            username=payload.username,
            full_name=(payload.full_name or payload.username or f"User {payload.telegram_id}").strip(),
            role=payload.role,
            added_by=current_owner.telegram_id,
            is_active=True,
        )
        db.add(employee)
    else:
        if employee.role == BotUserRole.OWNER:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Нельзя изменить роль владельца бота")
        employee.username = payload.username
        employee.full_name = (payload.full_name or payload.username or employee.full_name or f"User {payload.telegram_id}").strip()
        employee.role = payload.role
        employee.added_by = current_owner.telegram_id
        employee.is_active = True

    owner_bot_user = get_active_owner_bot_user(db)
    if owner_bot_user is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сначала необходимо назначить владельца бота")

    ensure_internal_user_for_bot_user(db, owner_bot_user, owner_bot_user=owner_bot_user)
    ensure_internal_user_for_bot_user(db, employee, owner_bot_user=owner_bot_user)
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{telegram_id}", response_model=RemoveEmployeeResponse)
def remove_employee(
    telegram_id: int,
    current_owner: BotUser = Depends(require_bot_owner),
    db: Session = Depends(get_db),
) -> RemoveEmployeeResponse:
    if telegram_id == current_owner.telegram_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя удалить владельца")

    employee = db.get(BotUser, telegram_id)
    if employee is None or not employee.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сотрудник не найден")
    if employee.role == BotUserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя удалить владельца")

    employee.is_active = False

    app_user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
    if app_user is not None:
        app_user.owner_id = None
        app_user.role = UserRole.DIRECTOR

    db.commit()
    return RemoveEmployeeResponse(removed=1)
