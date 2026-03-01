from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_scope_user_id, require_admin_or_director
from app.models.entities import BudgetRule, Campaign, MPAccount, User
from app.schemas.budget import BudgetRuleCreate, BudgetRuleOut
from app.services.sync import check_budget_rules, run_async

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/rules", response_model=list[BudgetRuleOut])
def list_rules(
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> list[BudgetRule]:
    scope_user_id = get_scope_user_id(current_user)
    return db.execute(
        select(BudgetRule)
        .join(Campaign, Campaign.id == BudgetRule.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(MPAccount.user_id == scope_user_id)
        .order_by(BudgetRule.id.desc())
    ).scalars().all()


@router.post("/rules", response_model=BudgetRuleOut)
def create_rule(
    payload: BudgetRuleCreate,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> BudgetRule:
    scope_user_id = get_scope_user_id(current_user)
    campaign = db.execute(
        select(Campaign).join(MPAccount, MPAccount.id == Campaign.account_id).where(
            Campaign.id == payload.campaign_id, MPAccount.user_id == scope_user_id
        )
    ).scalar_one_or_none()
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    rule = BudgetRule(
        campaign_id=payload.campaign_id,
        rule_type=payload.rule_type,
        threshold=payload.threshold,
        action=payload.action,
        is_active=payload.is_active,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.post("/rules/{rule_id}/toggle")
def toggle_rule(
    rule_id: int,
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    scope_user_id = get_scope_user_id(current_user)
    rule = db.execute(
        select(BudgetRule)
        .join(Campaign, Campaign.id == BudgetRule.campaign_id)
        .join(MPAccount, MPAccount.id == Campaign.account_id)
        .where(BudgetRule.id == rule_id, MPAccount.user_id == scope_user_id)
    ).scalar_one_or_none()
    if rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"is_active": rule.is_active}


@router.post("/check")
def run_budget_check(
    current_user: User = Depends(require_admin_or_director),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    # The routine scans all active rules globally; this endpoint is restricted
    # to authorized users and mostly useful for manual refresh.
    triggered = run_async(check_budget_rules(db))
    return {"triggered": triggered}
