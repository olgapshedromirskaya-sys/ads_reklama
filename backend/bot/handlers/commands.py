from __future__ import annotations

from datetime import date

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import ContextTypes
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.entities import Alert, Campaign, CampaignStat, MPAccount, User
from app.services.sync import pause_or_resume_campaign, run_async

settings = get_settings()


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    webapp_button = InlineKeyboardButton("Open WebApp", web_app=WebAppInfo(url=settings.webapp_url))
    settings_button = InlineKeyboardButton("Connect accounts", url=f"{settings.webapp_url}/settings")
    keyboard = InlineKeyboardMarkup([[webapp_button], [settings_button]])
    text = (
        "Welcome to MP Ads Manager.\n\n"
        "Use this bot to receive alerts, check summaries, and manage campaigns."
    )
    await update.effective_message.reply_text(text=text, reply_markup=keyboard)


async def dashboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = InlineKeyboardMarkup(
        [[InlineKeyboardButton("Open Dashboard", web_app=WebAppInfo(url=settings.webapp_url))]]
    )
    await update.effective_message.reply_text("Open your dashboard:", reply_markup=keyboard)


def _get_user_by_telegram_id(telegram_id: int) -> User | None:
    with SessionLocal() as db:
        return db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()


async def summary_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_id = update.effective_user.id if update.effective_user else None
    if telegram_id is None:
        return

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
        if not user:
            await update.effective_message.reply_text("User not linked yet. Open WebApp once to sign in.")
            return
        spend, orders, revenue = db.execute(
            select(
                func.coalesce(func.sum(CampaignStat.spend), 0),
                func.coalesce(func.sum(CampaignStat.orders), 0),
                func.coalesce(func.sum(CampaignStat.revenue), 0),
            )
            .join(Campaign, Campaign.id == CampaignStat.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(MPAccount.user_id == user.id, CampaignStat.date == date.today())
        ).one()
        drr = (float(spend) / float(revenue) * 100) if float(revenue) > 0 else 0.0
        text = (
            f"Today summary:\n"
            f"Spend: {float(spend):.2f}\n"
            f"Orders: {int(orders)}\n"
            f"DRR: {drr:.2f}%"
        )
        await update.effective_message.reply_text(text)


async def alerts_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_id = update.effective_user.id if update.effective_user else None
    if telegram_id is None:
        return

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
        if not user:
            await update.effective_message.reply_text("No linked account found. Open WebApp and sign in first.")
            return
        alerts = db.execute(
            select(Alert).where(Alert.user_id == user.id, Alert.is_read.is_(False)).order_by(Alert.created_at.desc()).limit(10)
        ).scalars().all()
        if not alerts:
            await update.effective_message.reply_text("No active alerts.")
            return
        lines = ["Active alerts:"]
        for alert in alerts:
            lines.append(f"- [{alert.type}] {alert.message}")
        await update.effective_message.reply_text("\n".join(lines))


async def campaigns_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_id = update.effective_user.id if update.effective_user else None
    if telegram_id is None:
        return

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
        if not user:
            await update.effective_message.reply_text("No linked account found. Open WebApp and sign in first.")
            return
        campaigns = db.execute(
            select(Campaign)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(MPAccount.user_id == user.id)
            .order_by(Campaign.id.desc())
            .limit(20)
        ).scalars().all()
        if not campaigns:
            await update.effective_message.reply_text("No campaigns found.")
            return
        lines = ["Campaigns:"]
        for campaign in campaigns:
            lines.append(f"- #{campaign.id} [{campaign.status}] {campaign.name}")
        await update.effective_message.reply_text("\n".join(lines))


async def pause_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await _change_campaign_state(update, context, pause=True)


async def resume_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await _change_campaign_state(update, context, pause=False)


async def _change_campaign_state(update: Update, context: ContextTypes.DEFAULT_TYPE, pause: bool) -> None:
    telegram_id = update.effective_user.id if update.effective_user else None
    if telegram_id is None:
        return
    if not context.args:
        command = "/pause <campaign_id>" if pause else "/resume <campaign_id>"
        await update.effective_message.reply_text(f"Usage: {command}")
        return

    try:
        campaign_id = int(context.args[0])
    except ValueError:
        await update.effective_message.reply_text("campaign_id must be integer")
        return

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
        if not user:
            await update.effective_message.reply_text("No linked account found. Open WebApp and sign in first.")
            return

        campaign = db.execute(
            select(Campaign)
            .options(joinedload(Campaign.account))
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(Campaign.id == campaign_id, MPAccount.user_id == user.id)
        ).scalar_one_or_none()
        if not campaign:
            await update.effective_message.reply_text("Campaign not found.")
            return

        run_async(pause_or_resume_campaign(campaign, pause=pause))
        campaign.status = "paused" if pause else "active"
        db.commit()
        await update.effective_message.reply_text(
            f"Campaign '{campaign.name}' set to {'paused' if pause else 'active'}."
        )
