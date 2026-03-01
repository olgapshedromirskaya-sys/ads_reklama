from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.entities import Alert, User
from app.schemas.alerts import AlertOut, AlertReadRequest

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertOut])
def list_alerts(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Alert]:
    stmt = select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.created_at.desc())
    if unread_only:
        stmt = stmt.where(Alert.is_read.is_(False))
    return db.execute(stmt).scalars().all()


@router.post("/read")
def mark_alerts_read(
    payload: AlertReadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    alerts = db.execute(select(Alert).where(Alert.id.in_(payload.alert_ids), Alert.user_id == current_user.id)).scalars().all()
    for alert in alerts:
        alert.is_read = True
    db.commit()
    return {"updated": len(alerts)}
