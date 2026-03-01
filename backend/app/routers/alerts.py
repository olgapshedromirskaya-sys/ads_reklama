from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, get_scope_user_id
from app.models.entities import Alert, User
from app.schemas.alerts import AlertOut, AlertReadRequest

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertOut])
def list_alerts(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Alert]:
    scope_user_id = get_scope_user_id(current_user)
    stmt = select(Alert).where(Alert.user_id == scope_user_id).order_by(Alert.created_at.desc())
    if unread_only:
        stmt = stmt.where(Alert.is_read.is_(False))
    return db.execute(stmt).scalars().all()


@router.post("/read")
def mark_alerts_read(
    payload: AlertReadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    scope_user_id = get_scope_user_id(current_user)
    alerts = db.execute(select(Alert).where(Alert.id.in_(payload.alert_ids), Alert.user_id == scope_user_id)).scalars().all()
    for alert in alerts:
        alert.is_read = True
    db.commit()
    return {"updated": len(alerts)}
