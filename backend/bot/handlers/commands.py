from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    Update,
    WebAppInfo,
)
from telegram.ext import ContextTypes

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.core.deps import get_scope_user_id
from app.models.entities import Alert, Campaign, CampaignStat, MPAccount, User, UserRole
from app.services.sync import pause_or_resume_campaign, run_async

settings = get_settings()

BTN_OPEN_DASHBOARD = "🚀 Открыть дашборд"
BTN_SUMMARY = "📈 Сводка"
BTN_CAMPAIGNS = "📢 Кампании"
BTN_ALERTS = "🔔 Уведомления"
BTN_SETTINGS = "⚙️ Настройки API"
BTN_TEAM = "👥 Сотрудники"
BTN_ADD_EMPLOYEE = "➕ Добавить сотрудника"
BTN_REMOVE_EMPLOYEE = "➖ Удалить сотрудника"
TEAM_ACTION_KEY = "team_action"


def _format_role(role: UserRole) -> str:
    mapping = {
        UserRole.DIRECTOR: "руководитель",
        UserRole.ADMIN: "администратор",
        UserRole.MANAGER: "менеджер",
    }
    return mapping.get(role, role.value)


def _is_director(user: User) -> bool:
    return user.role == UserRole.DIRECTOR and user.owner_id is None


def _build_main_menu(user: User) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = [
        [KeyboardButton(text=BTN_OPEN_DASHBOARD, web_app=WebAppInfo(url=settings.webapp_url))],
        [KeyboardButton(text=BTN_SUMMARY), KeyboardButton(text=BTN_CAMPAIGNS)],
    ]
    if user.role == UserRole.MANAGER:
        rows.append([KeyboardButton(text=BTN_ALERTS)])
    else:
        rows.append([KeyboardButton(text=BTN_ALERTS), KeyboardButton(text=BTN_SETTINGS)])
    if user.role in {UserRole.DIRECTOR, UserRole.ADMIN}:
        rows.append([KeyboardButton(text=BTN_TEAM)])
    if _is_director(user):
        rows.append([KeyboardButton(text=BTN_ADD_EMPLOYEE), KeyboardButton(text=BTN_REMOVE_EMPLOYEE)])
    return ReplyKeyboardMarkup(rows, resize_keyboard=True, is_persistent=True)


def _get_user_by_telegram_id(telegram_id: int) -> User | None:
    with SessionLocal() as db:
        return db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()


def _ensure_user(update: Update) -> User | None:
    telegram_user = update.effective_user
    if telegram_user is None:
        return None
    with SessionLocal() as db:
        user = db.execute(select(User).where(User.telegram_id == telegram_user.id)).scalar_one_or_none()
        if user is None:
            user = User(telegram_id=telegram_user.id, username=telegram_user.username)
            db.add(user)
        elif telegram_user.username:
            user.username = telegram_user.username
        db.commit()
        db.refresh(user)
        return user


def _parse_staff_role(raw_role: str) -> UserRole | None:
    normalized = raw_role.strip().lower()
    mapping = {
        "admin": UserRole.ADMIN,
        "administrator": UserRole.ADMIN,
        "админ": UserRole.ADMIN,
        "администратор": UserRole.ADMIN,
        "manager": UserRole.MANAGER,
        "менеджер": UserRole.MANAGER,
    }
    return mapping.get(normalized)


def _add_team_member_for_director(
    director_id: int,
    telegram_id: int,
    role: UserRole,
    username: str | None = None,
) -> tuple[bool, str]:
    with SessionLocal() as db:
        director = db.get(User, director_id)
        if director is None:
            return False, "Руководитель не найден."
        if not _is_director(director):
            return False, "Добавлять сотрудников может только руководитель."
        if telegram_id == director.telegram_id:
            return False, "Нельзя добавить себя в сотрудники."
        if role == UserRole.DIRECTOR:
            return False, "Для сотрудника доступны только роли admin или manager."

        member = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
        if member is None:
            member = User(
                telegram_id=telegram_id,
                username=username,
                role=role,
                owner_id=director.id,
            )
            db.add(member)
            db.commit()
            return True, f"Сотрудник {telegram_id} добавлен с ролью {_format_role(role)}."

        if member.owner_id is not None and member.owner_id != director.id:
            return False, "Пользователь уже относится к другой команде."

        member.owner_id = director.id
        member.role = role
        if username:
            member.username = username
        db.commit()
        return True, f"Сотруднику {telegram_id} назначена роль {_format_role(role)}."


def _remove_team_member_for_director(director_id: int, telegram_id: int) -> tuple[bool, str]:
    with SessionLocal() as db:
        director = db.get(User, director_id)
        if director is None:
            return False, "Руководитель не найден."
        if not _is_director(director):
            return False, "Удалять сотрудников может только руководитель."

        member = db.execute(
            select(User).where(
                User.telegram_id == telegram_id,
                User.owner_id == director.id,
            )
        ).scalar_one_or_none()
        if member is None:
            return False, "Сотрудник в вашей команде не найден."
        member.owner_id = None
        member.role = UserRole.DIRECTOR
        db.commit()
        return True, f"Сотрудник {telegram_id} удалён из команды."


async def _send_settings_link(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    settings_url = f"{settings.webapp_url.rstrip('/')}/settings"
    keyboard = InlineKeyboardMarkup(
        [[InlineKeyboardButton("⚙️ Открыть настройки WebApp", web_app=WebAppInfo(url=settings_url))]]
    )
    await message.reply_text("Настройки API и аккаунтов:", reply_markup=keyboard)


async def _send_menu(update: Update, user: User) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text("Главное меню:", reply_markup=_build_main_menu(user))


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    webapp_button = InlineKeyboardButton("🚀 Open WebApp", web_app=WebAppInfo(url=settings.webapp_url))
    settings_button = InlineKeyboardButton(
        "⚙️ Connect accounts",
        web_app=WebAppInfo(url=f"{settings.webapp_url.rstrip('/')}/settings"),
    )
    keyboard = InlineKeyboardMarkup([[webapp_button], [settings_button]])
    text = (
        "Welcome to MP Ads Manager.\n\n"
        f"Роль: {_format_role(user.role)}.\n"
        "Используйте кнопку WebApp для дашборда и меню ниже для быстрых действий."
    )
    await message.reply_text(text=text, reply_markup=keyboard)
    await _send_menu(update, user)


async def dashboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    keyboard = InlineKeyboardMarkup(
        [[InlineKeyboardButton("🚀 Открыть дашборд", web_app=WebAppInfo(url=settings.webapp_url))]]
    )
    await message.reply_text("Откройте визуальный дашборд WebApp:", reply_markup=keyboard)
    await _send_menu(update, user)


async def summary_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return

    scope_user_id = get_scope_user_id(user)
    with SessionLocal() as db:
        spend, orders, revenue = db.execute(
            select(
                func.coalesce(func.sum(CampaignStat.spend), 0),
                func.coalesce(func.sum(CampaignStat.orders), 0),
                func.coalesce(func.sum(CampaignStat.revenue), 0),
            )
            .join(Campaign, Campaign.id == CampaignStat.campaign_id)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(MPAccount.user_id == scope_user_id, CampaignStat.date == date.today())
        ).one()
        drr = (float(spend) / float(revenue) * 100) if float(revenue) > 0 else 0.0
        text = (
            f"📈 Сводка за сегодня:\n"
            f"Расход: {float(spend):.2f}\n"
            f"Заказы: {int(orders)}\n"
            f"ДРР: {drr:.2f}%"
        )
        await message.reply_text(text)


async def alerts_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return

    scope_user_id = get_scope_user_id(user)
    with SessionLocal() as db:
        alerts = db.execute(
            select(Alert)
            .where(Alert.user_id == scope_user_id, Alert.is_read.is_(False))
            .order_by(Alert.created_at.desc())
            .limit(10)
        ).scalars().all()
        if not alerts:
            await message.reply_text("Активных уведомлений нет.")
            return
        lines = ["🔔 Активные уведомления:"]
        for alert in alerts:
            lines.append(f"- [{alert.type}] {alert.message}")
        await message.reply_text("\n".join(lines))


async def campaigns_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return

    scope_user_id = get_scope_user_id(user)
    with SessionLocal() as db:
        campaigns = db.execute(
            select(Campaign)
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(MPAccount.user_id == scope_user_id)
            .order_by(Campaign.id.desc())
            .limit(20)
        ).scalars().all()
        if not campaigns:
            await message.reply_text("Кампании не найдены.")
            return
        lines = ["📢 Кампании:"]
        for campaign in campaigns:
            lines.append(f"- #{campaign.id} [{campaign.status}] {campaign.name}")
        await message.reply_text("\n".join(lines))


async def pause_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await _change_campaign_state(update, context, pause=True)


async def resume_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await _change_campaign_state(update, context, pause=False)


async def _change_campaign_state(update: Update, context: ContextTypes.DEFAULT_TYPE, pause: bool) -> None:
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    if user.role == UserRole.MANAGER:
        await message.reply_text("У менеджера нет прав на изменение статуса кампаний.")
        return
    if not context.args:
        command = "/pause <campaign_id>" if pause else "/resume <campaign_id>"
        await message.reply_text(f"Использование: {command}")
        return

    try:
        campaign_id = int(context.args[0])
    except ValueError:
        await message.reply_text("campaign_id должен быть целым числом")
        return

    scope_user_id = get_scope_user_id(user)
    with SessionLocal() as db:
        campaign = db.execute(
            select(Campaign)
            .options(joinedload(Campaign.account))
            .join(MPAccount, MPAccount.id == Campaign.account_id)
            .where(Campaign.id == campaign_id, MPAccount.user_id == scope_user_id)
        ).scalar_one_or_none()
        if not campaign:
            await message.reply_text("Кампания не найдена.")
            return

        run_async(pause_or_resume_campaign(campaign, pause=pause))
        campaign.status = "paused" if pause else "active"
        db.commit()
        await message.reply_text(
            f"Кампания «{campaign.name}» переведена в статус {'пауза' if pause else 'активна'}."
        )


async def team_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    if user.role not in {UserRole.DIRECTOR, UserRole.ADMIN}:
        await message.reply_text("У вас нет доступа к управлению сотрудниками.")
        return

    scope_user_id = get_scope_user_id(user)
    with SessionLocal() as db:
        members = db.execute(select(User).where(User.owner_id == scope_user_id).order_by(User.created_at.asc())).scalars().all()
    if not members:
        await message.reply_text("В команде пока нет сотрудников.")
        return

    lines = ["👥 Сотрудники команды:"]
    for member in members:
        display_name = f"@{member.username}" if member.username else str(member.telegram_id)
        lines.append(f"- {display_name} ({member.telegram_id}) — {_format_role(member.role)}")
    await message.reply_text("\n".join(lines))


async def _handle_add_employee_payload(update: Update, user: User, payload: str) -> None:
    message = update.effective_message
    if message is None:
        return
    parts = payload.split()
    if len(parts) < 2:
        await message.reply_text("Неверный формат. Пример: 123456789 manager")
        return
    try:
        telegram_id = int(parts[0])
    except ValueError:
        await message.reply_text("telegram_id должен быть числом.")
        return

    role = _parse_staff_role(parts[1])
    if role is None:
        await message.reply_text("Роль должна быть admin или manager.")
        return
    username = parts[2].lstrip("@") if len(parts) > 2 else None
    ok, result_message = _add_team_member_for_director(user.id, telegram_id, role, username)
    await message.reply_text(("✅ " if ok else "⚠️ ") + result_message)


async def _handle_remove_employee_payload(update: Update, user: User, payload: str) -> None:
    message = update.effective_message
    if message is None:
        return
    try:
        telegram_id = int(payload.strip())
    except ValueError:
        await message.reply_text("telegram_id должен быть числом.")
        return
    ok, result_message = _remove_team_member_for_director(user.id, telegram_id)
    await message.reply_text(("✅ " if ok else "⚠️ ") + result_message)


async def add_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    if not _is_director(user):
        await message.reply_text("Добавлять сотрудников может только руководитель.")
        return
    if len(context.args) < 2:
        context.user_data[TEAM_ACTION_KEY] = "add"
        await message.reply_text(
            "Введите сотрудника в формате:\n"
            "<telegram_id> <роль>\n"
            "Роли: admin, manager"
        )
        return
    await _handle_add_employee_payload(update, user, " ".join(context.args))


async def remove_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return
    if not _is_director(user):
        await message.reply_text("Удалять сотрудников может только руководитель.")
        return
    if not context.args:
        context.user_data[TEAM_ACTION_KEY] = "remove"
        await message.reply_text("Введите telegram_id сотрудника для удаления.")
        return
    await _handle_remove_employee_payload(update, user, context.args[0])


async def text_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return
    user = _ensure_user(update)
    if user is None:
        return

    text = (message.text or "").strip()
    pending_action = context.user_data.get(TEAM_ACTION_KEY)
    if pending_action == "add":
        context.user_data.pop(TEAM_ACTION_KEY, None)
        await _handle_add_employee_payload(update, user, text)
        return
    if pending_action == "remove":
        context.user_data.pop(TEAM_ACTION_KEY, None)
        await _handle_remove_employee_payload(update, user, text)
        return

    if text == BTN_SUMMARY:
        await summary_command(update, context)
        return
    if text == BTN_CAMPAIGNS:
        await campaigns_command(update, context)
        return
    if text == BTN_ALERTS:
        await alerts_command(update, context)
        return
    if text == BTN_SETTINGS:
        if user.role == UserRole.MANAGER:
            await message.reply_text("Настройки API доступны только руководителю и администратору.")
            return
        await _send_settings_link(update)
        return
    if text == BTN_TEAM:
        await team_command(update, context)
        return
    if text == BTN_ADD_EMPLOYEE:
        if not _is_director(user):
            await message.reply_text("Добавлять сотрудников может только руководитель.")
            return
        context.user_data[TEAM_ACTION_KEY] = "add"
        await message.reply_text(
            "Введите сотрудника в формате:\n"
            "<telegram_id> <роль>\n"
            "Роли: admin, manager"
        )
        return
    if text == BTN_REMOVE_EMPLOYEE:
        if not _is_director(user):
            await message.reply_text("Удалять сотрудников может только руководитель.")
            return
        context.user_data[TEAM_ACTION_KEY] = "remove"
        await message.reply_text("Введите telegram_id сотрудника для удаления.")
        return
    if text == BTN_OPEN_DASHBOARD:
        await dashboard_command(update, context)
        return

    await message.reply_text("Выберите действие кнопками меню или используйте /start.")
