from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import case, select
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    Update,
    WebAppInfo,
)
from telegram.ext import ApplicationHandlerStop, ContextTypes

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.entities import BotUser, BotUserRole, MPAccount, Marketplace, User, UserRole
from app.services.bot_users import build_full_name, ensure_internal_user_for_bot_user, get_active_bot_user, get_active_owner_bot_user

settings = get_settings()
logger = logging.getLogger(__name__)

BTN_DRR = "📊 ДРР"
BTN_WEEK_REPORT = "📈 Отчёт за неделю"
BTN_DIAGNOSTICS = "🔍 Диагностика"
BTN_PLAN_FACT = "📊 План/Факт"
BTN_AUTO_MINUS = "🚫 Авто-минусовка"
BTN_CAMPAIGNS = "📦 Кампании"
BTN_POSITIONS_BIDS = "📍 Позиции и ставки"
BTN_WHERE_SHOWN = "🔍 Где показывается"
BTN_EMPLOYEES = "👥 Сотрудники"
BTN_API_KEYS = "⚙️ API ключи"
BTN_OPEN_DASHBOARD = "🚀 Открыть дашборд"
BTN_SKIP = "Пропустить"
OWNER_TELEGRAM_ID = 545972485

ACCESS_CLOSED_TEXT = (
    "🔒 Доступ закрыт.\n"
    "Этот бот является приватным.\n"
    "Обратитесь к руководителю для получения доступа."
)
OWNER_ASSIGNED_TEXT = (
    "👑 Вы назначены Руководителем этого бота.\n"
    "Используйте /adduser для добавления сотрудников."
)
MANAGER_DENIED_TEXT = (
    "🚫 Недостаточно прав.\n"
    "Эта функция доступна только Руководителю/Администратору.\n"
    "Обратитесь к руководителю."
)
OWNER_ONLY_DENIED_TEXT = (
    "🚫 Недостаточно прав.\n"
    "Эта функция доступна только Руководителю.\n"
    "Обратитесь к руководителю."
)

EMPLOYEE_FLOW_KEY = "employee_flow"
API_FLOW_KEY = "api_flow"

CB_EMP_ADD = "emp:add"
CB_EMP_LIST = "emp:list"
CB_EMP_ROLE_PREFIX = "emp:role:"
CB_EMP_SKIP_USERNAME = "emp:skip_username"
CB_EMP_DELETE_PREFIX = "emp:delete:"
CB_EMP_DELETE_YES_PREFIX = "emp:delete_yes:"
CB_EMP_DELETE_CANCEL = "emp:delete_cancel"
CB_EMP_BACK = "emp:back"

CB_API_ADD_WB = "api:add_wb"
CB_API_ADD_OZON = "api:add_ozon"
CB_API_REFRESH_PREFIX = "api:refresh:"
CB_API_DELETE_PREFIX = "api:delete:"
CB_API_DELETE_YES_PREFIX = "api:delete_yes:"
CB_API_DELETE_CANCEL = "api:delete_cancel"
CB_API_BACK = "api:back"

ROLE_TO_TITLE = {
    BotUserRole.OWNER: "Руководитель",
    BotUserRole.ADMIN: "Администратор",
    BotUserRole.MANAGER: "Менеджер",
}
ROLE_TO_ICON = {
    BotUserRole.OWNER: "👑",
    BotUserRole.ADMIN: "👤",
    BotUserRole.MANAGER: "📋",
}


def _telegram_display_name(update: Update) -> str:
    user = update.effective_user
    if user is None:
        return "User"
    return build_full_name(user.first_name, user.last_name, user.username, user.id)


def _is_start_command(update: Update) -> bool:
    message = update.effective_message
    if message is None:
        return False
    text = (message.text or "").strip().lower()
    if not text:
        return False
    command = text.split(maxsplit=1)[0]
    return command.startswith("/start")


def _role_from_context(context: ContextTypes.DEFAULT_TYPE) -> BotUserRole:
    raw_role = context.user_data.get("bot_role")
    if raw_role in {BotUserRole.OWNER.value, BotUserRole.ADMIN.value, BotUserRole.MANAGER.value}:
        return BotUserRole(raw_role)
    return BotUserRole.MANAGER


def _is_admin_or_owner(context: ContextTypes.DEFAULT_TYPE) -> bool:
    return _role_from_context(context) in {BotUserRole.OWNER, BotUserRole.ADMIN}


def _format_user_label(bot_user: BotUser) -> str:
    if bot_user.username:
        return f"@{bot_user.username}"
    return f"ID {bot_user.telegram_id}"


def _owner_scope_user_id(db) -> int | None:
    owner_bot_user = get_active_owner_bot_user(db)
    if owner_bot_user is None:
        return None
    owner_user = ensure_internal_user_for_bot_user(db, owner_bot_user, owner_bot_user=owner_bot_user)
    return int(owner_user.id)


def _employee_management_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [InlineKeyboardButton("➕ Добавить сотрудника", callback_data=CB_EMP_ADD)],
            [InlineKeyboardButton("📋 Список сотрудников", callback_data=CB_EMP_LIST)],
        ]
    )


def _api_keys_management_keyboard(accounts: list[MPAccount]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for account in accounts:
        rows.append(
            [
                InlineKeyboardButton("🔄 Обновить токен", callback_data=f"{CB_API_REFRESH_PREFIX}{account.id}"),
                InlineKeyboardButton("❌ Удалить", callback_data=f"{CB_API_DELETE_PREFIX}{account.id}"),
            ]
        )
    rows.append([InlineKeyboardButton("➕ Добавить WB аккаунт", callback_data=CB_API_ADD_WB)])
    rows.append([InlineKeyboardButton("➕ Добавить Ozon аккаунт", callback_data=CB_API_ADD_OZON)])
    return InlineKeyboardMarkup(rows)


def _build_main_menu(role: BotUserRole) -> ReplyKeyboardMarkup:
    if role == BotUserRole.OWNER:
        rows = [
            [KeyboardButton(text=BTN_DRR), KeyboardButton(text=BTN_WEEK_REPORT)],
            [KeyboardButton(text=BTN_DIAGNOSTICS), KeyboardButton(text=BTN_PLAN_FACT)],
            [KeyboardButton(text=BTN_AUTO_MINUS), KeyboardButton(text=BTN_CAMPAIGNS)],
            [KeyboardButton(text=BTN_POSITIONS_BIDS), KeyboardButton(text=BTN_WHERE_SHOWN)],
            [KeyboardButton(text=BTN_EMPLOYEES), KeyboardButton(text=BTN_API_KEYS)],
            [KeyboardButton(text=BTN_OPEN_DASHBOARD)],
        ]
    elif role == BotUserRole.ADMIN:
        rows = [
            [KeyboardButton(text=BTN_DRR), KeyboardButton(text=BTN_WEEK_REPORT)],
            [KeyboardButton(text=BTN_DIAGNOSTICS), KeyboardButton(text=BTN_PLAN_FACT)],
            [KeyboardButton(text=BTN_AUTO_MINUS), KeyboardButton(text=BTN_CAMPAIGNS)],
            [KeyboardButton(text=BTN_POSITIONS_BIDS), KeyboardButton(text=BTN_WHERE_SHOWN)],
            [KeyboardButton(text=BTN_API_KEYS)],
            [KeyboardButton(text=BTN_OPEN_DASHBOARD)],
        ]
    else:
        rows = [
            [KeyboardButton(text=BTN_DRR), KeyboardButton(text=BTN_WEEK_REPORT)],
            [KeyboardButton(text=BTN_DIAGNOSTICS), KeyboardButton(text=BTN_CAMPAIGNS)],
            [KeyboardButton(text=BTN_AUTO_MINUS)],
            [KeyboardButton(text=BTN_POSITIONS_BIDS), KeyboardButton(text=BTN_WHERE_SHOWN)],
            [KeyboardButton(text=BTN_OPEN_DASHBOARD)],
        ]
    return ReplyKeyboardMarkup(rows, resize_keyboard=True, is_persistent=True)


def _dashboard_inline_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("✈️ Открыть WebApp", web_app=WebAppInfo(url=settings.webapp_url))]]
    )


def _diagnostics_inline_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("🚀 Открыть дашборд", web_app=WebAppInfo(url=settings.webapp_url))]]
    )


def _auto_minus_inline_keyboard() -> InlineKeyboardMarkup:
    base_url = settings.webapp_url.rstrip("/")
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    "✅ Применить авто-очистку",
                    web_app=WebAppInfo(url=f"{base_url}/queries"),
                ),
                InlineKeyboardButton("🚀 Открыть дашборд", web_app=WebAppInfo(url=settings.webapp_url)),
            ]
        ]
    )


async def _reply_text(update: Update, text: str, **kwargs: Any) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(text, **kwargs)


async def show_owner_menu(message) -> None:
    await message.reply_text(
        "👋 Добро пожаловать!\nРеклама маркетплейсов — управление и аналитика",
        reply_markup=_build_main_menu(BotUserRole.OWNER),
    )


async def _send_access_closed(update: Update) -> None:
    if update.callback_query is not None:
        await update.callback_query.answer()
    await _reply_text(update, ACCESS_CLOSED_TEXT)


async def _send_manager_denied(update: Update) -> None:
    await _reply_text(update, MANAGER_DENIED_TEXT)


async def _send_owner_only_denied(update: Update) -> None:
    await _reply_text(update, OWNER_ONLY_DENIED_TEXT)


def _clear_employee_flow(context: ContextTypes.DEFAULT_TYPE) -> None:
    context.user_data.pop(EMPLOYEE_FLOW_KEY, None)


def _clear_api_flow(context: ContextTypes.DEFAULT_TYPE) -> None:
    context.user_data.pop(API_FLOW_KEY, None)


def _clear_all_flows(context: ContextTypes.DEFAULT_TYPE) -> None:
    _clear_employee_flow(context)
    _clear_api_flow(context)


async def access_guard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    telegram_user = update.effective_user
    if telegram_user is None:
        return

    if telegram_user.id == OWNER_TELEGRAM_ID and _is_start_command(update):
        context.user_data["bot_role"] = BotUserRole.OWNER.value
        context.user_data["bot_telegram_id"] = OWNER_TELEGRAM_ID
        context.user_data["bot_user_telegram_id"] = OWNER_TELEGRAM_ID
        context.user_data["bot_username"] = telegram_user.username
        context.user_data["bot_full_name"] = _telegram_display_name(update)
        return

    with SessionLocal() as db:
        bot_user = get_active_bot_user(db, telegram_user.id)
        if bot_user is None:
            owner = get_active_owner_bot_user(db)
            if owner is None and _is_start_command(update):
                bot_user = BotUser(
                    telegram_id=telegram_user.id,
                    username=telegram_user.username,
                    full_name=_telegram_display_name(update),
                    role=BotUserRole.OWNER,
                    added_by=telegram_user.id,
                    is_active=True,
                )
                db.add(bot_user)
                ensure_internal_user_for_bot_user(db, bot_user, owner_bot_user=bot_user)
                db.commit()
                db.refresh(bot_user)
                context.user_data["just_became_owner"] = True
            else:
                await _send_access_closed(update)
                raise ApplicationHandlerStop
        else:
            changed = False
            if bot_user.username != telegram_user.username:
                bot_user.username = telegram_user.username
                changed = True
            full_name = _telegram_display_name(update)
            if bot_user.full_name != full_name:
                bot_user.full_name = full_name
                changed = True
            if changed:
                owner_bot_user = get_active_owner_bot_user(db)
                ensure_internal_user_for_bot_user(db, bot_user, owner_bot_user=owner_bot_user)
                db.commit()

        context.user_data["bot_role"] = bot_user.role.value
        context.user_data["bot_telegram_id"] = int(bot_user.telegram_id)
        context.user_data["bot_username"] = bot_user.username
        context.user_data["bot_full_name"] = bot_user.full_name


async def _send_in_development_message(update: Update) -> None:
    await _reply_text(update, "🔧 Функция в разработке. Скоро будет доступна!")


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return
    if message.from_user and message.from_user.id == OWNER_TELEGRAM_ID:
        # Always allow owner, show full menu
        await show_owner_menu(message)
        return
    logger.info("Received /start from telegram_id=%s", update.effective_user.id if update.effective_user else None)

    role = _role_from_context(context)
    if context.user_data.pop("just_became_owner", False):
        await message.reply_text(OWNER_ASSIGNED_TEXT)

    await message.reply_text(
        "👋 Добро пожаловать!\nРеклама маркетплейсов — управление и аналитика",
        reply_markup=_build_main_menu(role),
    )


async def dashboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _reply_text(
        update,
        "Откройте дашборд в WebApp:",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_drr_report(update: Update) -> None:
    await _reply_text(
        update,
        "📊 ДРР отчёт\n\n"
        "🔵 Ozon: 5.7% 🟢 Шик\n"
        "🟣 WB: 8.4% 🟢 Шик\n\n"
        "Худшие кампании:\n"
        "🔴 Джинсы slim fit (WB) — 37.7%\n"
        "🟡 Платья летние (WB) — 17.2%\n"
        "🟢 Кроссовки женские (WB) — 8.2%\n\n"
        "[🚀 Открыть дашборд]",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_diagnostics_report(update: Update) -> None:
    await _reply_text(
        update,
        "🔍 Авто-диагностика\n\n"
        "Обнаружено 4 проблемы:\n\n"
        "🔴 Джинсы slim fit (WB)\n"
        "- ДРР 37.7% — убыточна\n"
        "- CTR 1.0% — низкий, смени фото\n\n"
        "🟡 Платья летние (WB)\n"
        "- CR 3.5% — карточка не убеждает\n\n"
        "🟡 Рюкзак туристический (Ozon)\n"
        "- ДРР 16.4% — на грани, снизь ставку\n\n"
        "💡 Рекомендация дня:\n"
        "Поставь Джинсы slim fit на паузу — теряешь 70,200₽ на убыточной кампании\n\n"
        "[🚀 Открыть дашборд]",
        reply_markup=_diagnostics_inline_keyboard(),
    )


async def _send_week_report(update: Update) -> None:
    await _reply_text(
        update,
        "📈 Отчёт за неделю\n\n"
        "🔵 Ozon:\n"
        "Показы: 847,000 | CTR: 2.9% 🟡\n"
        "Клики: 24,563 | CPC: 22₽\n"
        "Заказы: 697 | CR: 2.8% 🔴\n"
        "Выручка: 658,000₽\n"
        "ДРР: 5.7% 🟢\n\n"
        "🟣 WB:\n"
        "Показы: 1,240,000 | CTR: 3.1% 🟡\n"
        "Клики: 38,440 | CPC: 19₽\n"
        "Заказы: 1,247 | CR: 3.2% 🟡\n"
        "Выручка: 3,245,000₽\n"
        "ДРР: 8.4% 🟢\n\n"
        "📊 Выкуп с рекламы (WB):\n"
        "Кроссовки женские: 374 из 441 → 84.8% 🟢\n"
        "Платья летние: 158 из 198 → 79.8% 🟡\n"
        "Джинсы slim fit: 21 из 31 → 67.7% 🔴 ⚠️ Низкий выкуп\n\n"
        "💡 Рекомендации:\n"
        "- Масштабируй Кроссовки женские — ДРР 8.2%\n"
        "- Останови Джинсы slim fit — ДРР 37.7%\n"
        "- 7 нерелевантных ключей к удалению"
    )


async def _send_campaigns_report(update: Update) -> None:
    await _reply_text(
        update,
        "📦 Кампании\n\n"
        "🟣 WB: 3 активные кампании\n"
        "🔵 Ozon: 3 активные кампании\n\n"
        "📍 Топ позиции сегодня (WB):\n"
        "кроссовки женские → поз.3 ↑ ставка 220₽\n"
        "платья летние → поз.5 ↑ ставка 210₽\n"
        "джинсы slim fit → поз.22 ↓ ставка 155₽ ⚠️ падает\n\n"
        "📍 Размещение WB (сегодня):\n\n"
        "Кроссовки женские:\n"
        "🔍 Поиск: 4.0% CTR, ДРР 7.1% 🟢\n"
        "📦 Полки: 2.5% CTR, ДРР 14.8% 🟡\n\n"
        "Джинсы slim fit:\n"
        "🔍 Поиск: 1.0% CTR, ДРР 32.1% 🔴\n"
        "📦 Полки: 1.0% CTR, ДРР 50.0% 🔴 ⚠️ Убыточно!\n\n"
        "💡 Отключите Полки у Джинсы slim fit — ДРР 50%",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_positions_and_bids_report(update: Update) -> None:
    await _reply_text(
        update,
        "📍 Позиции по ключам (WB) — сегодня\n\n"
        "🟣 Кроссовки женские:\n"
        "- кроссовки женские → поз.3 ↑ | 220₽ | 🔍 Поиск | 187 заказов\n"
        "- кроссовки на платформе → поз.12 → | 220₽ | 🔍 Поиск | 94 заказов\n"
        "- белые кроссовки → поз.7 ↓ | 210₽ | 🔍 Поиск | 62 заказов\n\n"
        "🟣 Джинсы slim fit: ⚠️ Позиции падают!\n"
        "- джинсы slim fit → поз.22 ↓3 🔴 | 155₽ | 🔍 Поиск\n"
        "- джинсы скинни → поз.31 ↓4 🔴 | 145₽ | 🔍 Поиск\n\n"
        "💡 Рекомендация: повысьте ставку у Джинсы slim fit — позиции падают 3 дня подряд\n\n"
        "[🚀 Открыть дашборд]",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_where_shown_report(update: Update) -> None:
    await _reply_text(
        update,
        "🔍 Размещение рекламы WB — сегодня\n\n"
        "🟣 Кроссовки женские:\n"
        "🔍 Поиск: показы 180,000 | заказы 380 | ставка 220₽ | ДРР 7.1% 🟢\n"
        "📦 Полки: показы 65,000 | заказы 61 | ставка 180₽ | ДРР 14.8% 🟡\n\n"
        "🟣 Платья летние:\n"
        "🔍 Поиск: показы 140,000 | заказы 165 | ставка 210₽ | ДРР 15.8% 🟡\n"
        "📦 Полки: показы 49,000 | заказы 33 | ставка 170₽ | ДРР 21.1% 🔴\n\n"
        "🟣 Джинсы slim fit: ⚠️ Убыточно!\n"
        "🔍 Поиск: показы 110,000 | заказы 22 | ставка 155₽ | ДРР 32.1% 🔴\n"
        "📦 Полки: показы 46,000 | заказы 9 | ставка 120₽ | ДРР 50.0% 🔴\n\n"
        "💡 Отключите Полки у Джинсы slim fit — ДРР 50%, убыточно!\n\n"
        "[🚀 Открыть дашборд]",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_plan_fact_report(update: Update) -> None:
    await _reply_text(
        update,
        "📊 План/Факт на март 2026\n\n"
        "🟣 WB:\n"
        "💰 Бюджет: 163,170₽ из 350,000₽ (46.6%)\n"
        "📦 Заказы: 441 из 850 (51.9%) 🟢 Опережаем\n"
        "Прогноз заказов: ~974 (план 850) ✅\n\n"
        "🔵 Ozon:\n"
        "💰 Бюджет: 38,427₽ из 120,000₽ (32.0%)\n"
        "📦 Заказы: 138 из 400 (34.5%) 🟢 В норме\n"
        "Прогноз заказов: ~305 (план 400) 🟡 Отстаём\n\n"
        "💡 Рекомендация: по WB всё хорошо, по Ozon увеличьте рекламный бюджет",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_auto_minus_result(update: Update) -> None:
    await _reply_text(
        update,
        "🚫 Авто-минусовка\n\n"
        "WB — найдено 5 нерелевантных ключей:\n"
        "- кроссовки мужские 46 — 1,200 кликов, 0 заказов, 4,800₽/день\n"
        "- тапочки домашние — 890 кликов, 0 заказов, 3,200₽/день\n"
        "- сапоги зимние — 450 кликов, 0 заказов, 2,100₽/день\n"
        "- джинсы оптом — 380 кликов, 0 заказов, 1,900₽/день\n"
        "- джинсы б/у — 290 кликов, 0 заказов, 1,450₽/день\n\n"
        "Ozon — найдено 2 нерелевантных ключа:\n"
        "- термокружка дешево — 410 кликов, 0 заказов, 8,700₽/день\n"
        "- рюкзак оптом — 340 кликов, 0 заказов, 3,400₽/день\n\n"
        "Итого сливают: 25,550₽/день (766,500₽/мес)\n\n"
        "[✅ Применить авто-очистку] [🚀 Открыть дашборд]",
        reply_markup=_auto_minus_inline_keyboard(),
    )


async def _show_employee_management(update: Update) -> None:
    with SessionLocal() as db:
        owner = get_active_owner_bot_user(db)
    owner_label = _format_user_label(owner) if owner else "ID —"
    await _reply_text(
        update,
        "👥 Управление сотрудниками\n\n"
        "Текущие сотрудники:\n"
        f"👑 {owner_label} — Руководитель\n\n"
        "Добавить сотрудника:\n"
        "[➕ Добавить сотрудника]\n"
        "[📋 Список сотрудников]",
        reply_markup=_employee_management_keyboard(),
    )


def _employee_list_markup(employees: list[BotUser]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for employee in employees:
        if employee.role == BotUserRole.OWNER:
            continue
        rows.append(
            [
                InlineKeyboardButton(
                    f"❌ Удалить {_format_user_label(employee)}",
                    callback_data=f"{CB_EMP_DELETE_PREFIX}{employee.telegram_id}",
                )
            ]
        )
    rows.append([InlineKeyboardButton("⬅️ Назад", callback_data=CB_EMP_BACK)])
    return InlineKeyboardMarkup(rows)


async def _show_employee_list(update: Update) -> None:
    with SessionLocal() as db:
        role_order = case(
            (BotUser.role == BotUserRole.OWNER, 0),
            (BotUser.role == BotUserRole.ADMIN, 1),
            else_=2,
        )
        employees = db.execute(
            select(BotUser).where(BotUser.is_active.is_(True)).order_by(role_order.asc(), BotUser.added_at.asc())
        ).scalars().all()

    lines: list[str] = ["👥 Список сотрудников:\n"]
    for index, employee in enumerate(employees, start=1):
        icon = ROLE_TO_ICON.get(employee.role, "👤")
        title = ROLE_TO_TITLE.get(employee.role, "Сотрудник")
        lines.append(f"{index}. {icon} {_format_user_label(employee)} — {title}")
    lines.append(f"\nВсего: {len(employees)} сотрудника")

    await _reply_text(
        update,
        "\n".join(lines),
        reply_markup=_employee_list_markup(employees),
    )


def _api_accounts_text(accounts: list[MPAccount]) -> str:
    wb_accounts = [item for item in accounts if item.marketplace == Marketplace.WB and item.is_active]
    ozon_accounts = [item for item in accounts if item.marketplace == Marketplace.OZON and item.is_active]

    lines: list[str] = ["⚙️ Управление API ключами", "", "🟣 Wildberries:"]
    if wb_accounts:
        for account in wb_accounts:
            lines.append(f"{account.name} — подключён ✅")
            lines.append("[🔄 Обновить токен] [❌ Удалить]")
    else:
        lines.append("Нет подключённых аккаунтов")

    lines.append("")
    lines.append("🔵 Ozon:")
    if ozon_accounts:
        for account in ozon_accounts:
            lines.append(f"{account.name} — подключён ✅")
            lines.append("[🔄 Обновить токен] [❌ Удалить]")
    else:
        lines.append("Нет подключённых аккаунтов")
    lines.append("")
    lines.append("[➕ Добавить WB аккаунт]")
    lines.append("[➕ Добавить Ozon аккаунт]")
    return "\n".join(lines)


async def _show_api_keys(update: Update) -> None:
    with SessionLocal() as db:
        owner_scope_id = _owner_scope_user_id(db)
        if owner_scope_id is None:
            await _reply_text(update, "Сначала назначьте руководителя через /start.")
            return
        accounts = db.execute(select(MPAccount).where(MPAccount.user_id == owner_scope_id).order_by(MPAccount.created_at.asc())).scalars().all()
    await _reply_text(
        update,
        _api_accounts_text(accounts),
        reply_markup=_api_keys_management_keyboard([item for item in accounts if item.is_active]),
    )


async def _start_add_employee_flow(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    _clear_all_flows(context)
    context.user_data[EMPLOYEE_FLOW_KEY] = {"step": "await_id"}
    await _reply_text(update, "Введите Telegram ID сотрудника:")


async def _save_employee_from_flow(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    username_raw: str | None,
) -> None:
    flow = context.user_data.get(EMPLOYEE_FLOW_KEY) or {}
    telegram_id = int(flow.get("telegram_id", 0))
    role_raw = flow.get("role")
    if telegram_id <= 0 or role_raw not in {"admin", "manager"}:
        _clear_employee_flow(context)
        await _reply_text(update, "Не удалось сохранить сотрудника. Начните заново: /adduser")
        return

    role = BotUserRole.ADMIN if role_raw == "admin" else BotUserRole.MANAGER
    username = (username_raw or "").strip().lstrip("@") or None
    owner_telegram_id = int(context.user_data.get("bot_user_telegram_id", 0))

    with SessionLocal() as db:
        owner_bot_user = get_active_owner_bot_user(db)
        if owner_bot_user is None or owner_bot_user.telegram_id != owner_telegram_id:
            _clear_employee_flow(context)
            await _reply_text(update, "Только руководитель может добавлять сотрудников.")
            return

        if telegram_id == owner_bot_user.telegram_id:
            await _reply_text(update, "Нельзя добавить руководителя как сотрудника.")
            return

        employee = db.get(BotUser, telegram_id)
        if employee is None:
            employee = BotUser(
                telegram_id=telegram_id,
                username=username,
                full_name=username or f"User {telegram_id}",
                role=role,
                added_by=owner_bot_user.telegram_id,
                is_active=True,
            )
            db.add(employee)
        else:
            if employee.role == BotUserRole.OWNER:
                await _reply_text(update, "Нельзя изменить роль владельца бота.")
                return
            employee.username = username
            employee.full_name = username or employee.full_name or f"User {telegram_id}"
            employee.role = role
            employee.added_by = owner_bot_user.telegram_id
            employee.is_active = True

        ensure_internal_user_for_bot_user(db, owner_bot_user, owner_bot_user=owner_bot_user)
        ensure_internal_user_for_bot_user(db, employee, owner_bot_user=owner_bot_user)
        db.commit()

    _clear_employee_flow(context)
    role_title = "Администратор" if role == BotUserRole.ADMIN else "Менеджер"
    await _reply_text(
        update,
        "✅ Сотрудник добавлен!\n"
        f"ID: {telegram_id}\n"
        f"Роль: {role_title}\n"
        "Теперь они могут использовать бота.",
    )


async def _handle_employee_text_flow(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str) -> bool:
    flow = context.user_data.get(EMPLOYEE_FLOW_KEY)
    if not flow:
        return False

    step = flow.get("step")
    if step == "await_id":
        raw = text.strip()
        if not raw.isdigit():
            await _reply_text(update, "Введите Telegram ID сотрудника цифрами:")
            return True
        telegram_id = int(raw)
        if telegram_id <= 0:
            await _reply_text(update, "Telegram ID должен быть положительным числом.")
            return True
        flow["telegram_id"] = telegram_id
        flow["step"] = "await_role"
        await _reply_text(
            update,
            f"Выберите роль для пользователя {telegram_id}:",
            reply_markup=InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton("👤 Администратор", callback_data=f"{CB_EMP_ROLE_PREFIX}admin"),
                        InlineKeyboardButton("📋 Менеджер", callback_data=f"{CB_EMP_ROLE_PREFIX}manager"),
                    ]
                ]
            ),
        )
        return True

    if step == "await_username":
        if text.strip().lower() == BTN_SKIP.lower():
            await _save_employee_from_flow(update, context, None)
            return True
        await _save_employee_from_flow(update, context, text.strip())
        return True

    return False


async def _start_add_wb_flow(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    _clear_all_flows(context)
    context.user_data[API_FLOW_KEY] = {"type": "add_wb", "step": "await_name"}
    await _reply_text(update, "Введите название аккаунта WB:")


async def _start_add_ozon_flow(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    _clear_all_flows(context)
    context.user_data[API_FLOW_KEY] = {"type": "add_ozon", "step": "await_name"}
    await _reply_text(update, "Введите название аккаунта Ozon:")


def _get_account_for_owner_scope(db, account_id: int) -> MPAccount | None:
    owner_scope_id = _owner_scope_user_id(db)
    if owner_scope_id is None:
        return None
    return db.execute(
        select(MPAccount).where(MPAccount.id == account_id, MPAccount.user_id == owner_scope_id)
    ).scalar_one_or_none()


async def _handle_api_text_flow(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str) -> bool:
    flow = context.user_data.get(API_FLOW_KEY)
    if not flow:
        return False

    flow_type = flow.get("type")
    step = flow.get("step")
    value = text.strip()

    with SessionLocal() as db:
        owner_scope_id = _owner_scope_user_id(db)
        if owner_scope_id is None:
            _clear_api_flow(context)
            await _reply_text(update, "Сначала назначьте руководителя через /start.")
            return True

        if flow_type == "add_wb":
            if step == "await_name":
                if not value:
                    await _reply_text(update, "Введите название аккаунта WB:")
                    return True
                flow["name"] = value
                flow["step"] = "await_token"
                await _reply_text(update, "Введите API Token WB:")
                return True
            if step == "await_token":
                name = flow.get("name", "WB аккаунт")
                account = MPAccount(
                    user_id=owner_scope_id,
                    marketplace=Marketplace.WB,
                    name=name,
                    api_token=value,
                    is_active=True,
                    needs_reconnection=False,
                )
                db.add(account)
                db.commit()
                _clear_api_flow(context)
                await _reply_text(update, f"✅ WB аккаунт '{name}' добавлен!")
                return True

        if flow_type == "add_ozon":
            if step == "await_name":
                if not value:
                    await _reply_text(update, "Введите название аккаунта Ozon:")
                    return True
                flow["name"] = value
                flow["step"] = "await_client_id"
                await _reply_text(update, "Введите Client ID Ozon:")
                return True
            if step == "await_client_id":
                flow["client_id"] = value
                flow["step"] = "await_api_key"
                await _reply_text(update, "Введите API Key Ozon:")
                return True
            if step == "await_api_key":
                name = flow.get("name", "Ozon аккаунт")
                account = MPAccount(
                    user_id=owner_scope_id,
                    marketplace=Marketplace.OZON,
                    name=name,
                    client_id=flow.get("client_id"),
                    api_key=value,
                    is_active=True,
                    needs_reconnection=False,
                )
                db.add(account)
                db.commit()
                _clear_api_flow(context)
                await _reply_text(update, f"✅ Ozon аккаунт '{name}' добавлен!")
                return True

        if flow_type == "refresh_wb":
            account_id = int(flow.get("account_id", 0))
            account = _get_account_for_owner_scope(db, account_id)
            if account is None:
                _clear_api_flow(context)
                await _reply_text(update, "Аккаунт не найден.")
                return True
            if step == "await_token":
                account.api_token = value
                account.is_active = True
                account.needs_reconnection = False
                db.commit()
                _clear_api_flow(context)
                await _reply_text(update, f"✅ Токен WB аккаунта '{account.name}' обновлён.")
                return True

        if flow_type == "refresh_ozon":
            account_id = int(flow.get("account_id", 0))
            account = _get_account_for_owner_scope(db, account_id)
            if account is None:
                _clear_api_flow(context)
                await _reply_text(update, "Аккаунт не найден.")
                return True
            if step == "await_client_id":
                flow["client_id"] = value
                flow["step"] = "await_api_key"
                await _reply_text(update, "Введите API Key Ozon:")
                return True
            if step == "await_api_key":
                account.client_id = flow.get("client_id")
                account.api_key = value
                account.is_active = True
                account.needs_reconnection = False
                db.commit()
                _clear_api_flow(context)
                await _reply_text(update, f"✅ Данные Ozon аккаунта '{account.name}' обновлены.")
                return True

    _clear_api_flow(context)
    await _reply_text(update, "Не удалось завершить операцию. Попробуйте снова.")
    return True


async def summary_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_drr_report(update)


async def alerts_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def campaigns_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_campaigns_report(update)


async def pause_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def resume_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def team_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    role = _role_from_context(context)
    if role == BotUserRole.OWNER:
        await _show_employee_management(update)
        return
    if role == BotUserRole.MANAGER:
        await _send_manager_denied(update)
        return
    await _send_owner_only_denied(update)


async def add_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    role = _role_from_context(context)
    if role != BotUserRole.OWNER:
        if role == BotUserRole.MANAGER:
            await _send_manager_denied(update)
        else:
            await _send_owner_only_denied(update)
        return
    await _start_add_employee_flow(update, context)


async def remove_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    role = _role_from_context(context)
    if role != BotUserRole.OWNER:
        if role == BotUserRole.MANAGER:
            await _send_manager_denied(update)
        else:
            await _send_owner_only_denied(update)
        return
    await _show_employee_list(update)


async def callback_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if query is None:
        return
    await query.answer()
    data = query.data or ""
    role = _role_from_context(context)

    if data in {CB_EMP_ADD, CB_EMP_LIST, CB_EMP_BACK} or data.startswith(
        (CB_EMP_ROLE_PREFIX, CB_EMP_DELETE_PREFIX, CB_EMP_DELETE_YES_PREFIX)
    ) or data in {CB_EMP_SKIP_USERNAME, CB_EMP_DELETE_CANCEL}:
        if role != BotUserRole.OWNER:
            if role == BotUserRole.MANAGER:
                await _send_manager_denied(update)
            else:
                await _send_owner_only_denied(update)
            return

        if data == CB_EMP_ADD:
            await _start_add_employee_flow(update, context)
            return
        if data == CB_EMP_LIST:
            await _show_employee_list(update)
            return
        if data == CB_EMP_BACK:
            await _show_employee_management(update)
            return
        if data.startswith(CB_EMP_ROLE_PREFIX):
            flow = context.user_data.get(EMPLOYEE_FLOW_KEY)
            if not flow or flow.get("step") != "await_role":
                await _reply_text(update, "Сначала введите Telegram ID сотрудника.")
                return
            role_value = data.removeprefix(CB_EMP_ROLE_PREFIX)
            if role_value not in {"admin", "manager"}:
                await _reply_text(update, "Выберите корректную роль.")
                return
            flow["role"] = role_value
            flow["step"] = "await_username"
            await _reply_text(
                update,
                "Введите @username сотрудника (или нажмите Пропустить):",
                reply_markup=InlineKeyboardMarkup(
                    [[InlineKeyboardButton("Пропустить", callback_data=CB_EMP_SKIP_USERNAME)]]
                ),
            )
            return
        if data == CB_EMP_SKIP_USERNAME:
            await _save_employee_from_flow(update, context, None)
            return
        if data.startswith(CB_EMP_DELETE_PREFIX):
            telegram_id = int(data.removeprefix(CB_EMP_DELETE_PREFIX))
            with SessionLocal() as db:
                employee = db.get(BotUser, telegram_id)
                if employee is None or not employee.is_active:
                    await _reply_text(update, "Сотрудник уже удалён.")
                    return
                title = ROLE_TO_TITLE.get(employee.role, "Сотрудник")
                await _reply_text(
                    update,
                    f"Удалить {_format_user_label(employee)} ({title})?",
                    reply_markup=InlineKeyboardMarkup(
                        [
                            [
                                InlineKeyboardButton(
                                    "✅ Да, удалить",
                                    callback_data=f"{CB_EMP_DELETE_YES_PREFIX}{telegram_id}",
                                ),
                                InlineKeyboardButton("❌ Отмена", callback_data=CB_EMP_DELETE_CANCEL),
                            ]
                        ]
                    ),
                )
            return
        if data == CB_EMP_DELETE_CANCEL:
            await _reply_text(update, "Удаление отменено.")
            return
        if data.startswith(CB_EMP_DELETE_YES_PREFIX):
            telegram_id = int(data.removeprefix(CB_EMP_DELETE_YES_PREFIX))
            removed_label = f"ID {telegram_id}"
            with SessionLocal() as db:
                employee = db.get(BotUser, telegram_id)
                if employee is None or not employee.is_active:
                    await _reply_text(update, "Сотрудник уже удалён.")
                    return
                removed_label = _format_user_label(employee)
                if employee.role == BotUserRole.OWNER:
                    await _reply_text(update, "Нельзя удалить владельца бота.")
                    return
                employee.is_active = False
                app_user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
                if app_user is not None:
                    app_user.owner_id = None
                    app_user.role = UserRole.DIRECTOR
                db.commit()
            await _reply_text(update, f"✅ Сотрудник {removed_label} удалён и больше не имеет доступа к боту.")
            return

    if data in {CB_API_ADD_WB, CB_API_ADD_OZON, CB_API_BACK, CB_API_DELETE_CANCEL} or data.startswith(
        (CB_API_REFRESH_PREFIX, CB_API_DELETE_PREFIX, CB_API_DELETE_YES_PREFIX)
    ):
        if not _is_admin_or_owner(context):
            await _send_manager_denied(update)
            return

        if data == CB_API_ADD_WB:
            await _start_add_wb_flow(update, context)
            return
        if data == CB_API_ADD_OZON:
            await _start_add_ozon_flow(update, context)
            return
        if data == CB_API_BACK:
            await _show_api_keys(update)
            return
        if data == CB_API_DELETE_CANCEL:
            await _reply_text(update, "Удаление аккаунта отменено.")
            return
        if data.startswith(CB_API_REFRESH_PREFIX):
            account_id = int(data.removeprefix(CB_API_REFRESH_PREFIX))
            with SessionLocal() as db:
                account = _get_account_for_owner_scope(db, account_id)
                if account is None:
                    await _reply_text(update, "Аккаунт не найден.")
                    return
                _clear_all_flows(context)
                if account.marketplace == Marketplace.WB:
                    context.user_data[API_FLOW_KEY] = {"type": "refresh_wb", "step": "await_token", "account_id": account.id}
                    await _reply_text(update, "Введите новый API Token WB:")
                else:
                    context.user_data[API_FLOW_KEY] = {
                        "type": "refresh_ozon",
                        "step": "await_client_id",
                        "account_id": account.id,
                    }
                    await _reply_text(update, "Введите новый Client ID Ozon:")
            return
        if data.startswith(CB_API_DELETE_PREFIX):
            account_id = int(data.removeprefix(CB_API_DELETE_PREFIX))
            await _reply_text(
                update,
                "Удалить аккаунт?\n[✅ Да, удалить] [❌ Отмена]",
                reply_markup=InlineKeyboardMarkup(
                    [
                        [
                            InlineKeyboardButton("✅ Да, удалить", callback_data=f"{CB_API_DELETE_YES_PREFIX}{account_id}"),
                            InlineKeyboardButton("❌ Отмена", callback_data=CB_API_DELETE_CANCEL),
                        ]
                    ]
                ),
            )
            return
        if data.startswith(CB_API_DELETE_YES_PREFIX):
            account_id = int(data.removeprefix(CB_API_DELETE_YES_PREFIX))
            with SessionLocal() as db:
                account = _get_account_for_owner_scope(db, account_id)
                if account is None:
                    await _reply_text(update, "Аккаунт не найден.")
                    return
                account.is_active = False
                account.api_token = None
                account.client_id = None
                account.api_key = None
                account.needs_reconnection = True
                account_name = account.name
                db.commit()
            await _reply_text(update, f"✅ Аккаунт '{account_name}' удалён.")
            await _show_api_keys(update)
            return


async def text_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return

    text = (message.text or "").strip()
    if await _handle_employee_text_flow(update, context, text):
        return
    if await _handle_api_text_flow(update, context, text):
        return

    role = _role_from_context(context)
    if text == BTN_DRR:
        await _send_drr_report(update)
        return
    if text == BTN_DIAGNOSTICS:
        await _send_diagnostics_report(update)
        return
    if text == BTN_WEEK_REPORT:
        await _send_week_report(update)
        return
    if text == BTN_PLAN_FACT:
        if role == BotUserRole.MANAGER:
            await _send_manager_denied(update)
            return
        await _send_plan_fact_report(update)
        return
    if text == BTN_OPEN_DASHBOARD:
        await dashboard_command(update, context)
        return
    if text == BTN_AUTO_MINUS:
        await _send_auto_minus_result(update)
        return
    if text == BTN_CAMPAIGNS:
        await _send_campaigns_report(update)
        return
    if text == BTN_POSITIONS_BIDS:
        await _send_positions_and_bids_report(update)
        return
    if text == BTN_WHERE_SHOWN:
        await _send_where_shown_report(update)
        return
    if text == BTN_EMPLOYEES:
        if role == BotUserRole.OWNER:
            await _show_employee_management(update)
            return
        if role == BotUserRole.MANAGER:
            await _send_manager_denied(update)
            return
        await _send_owner_only_denied(update)
        return
    if text == BTN_API_KEYS:
        if role in {BotUserRole.OWNER, BotUserRole.ADMIN}:
            await _show_api_keys(update)
            return
        await _send_manager_denied(update)
        return

    await _send_in_development_message(update)
