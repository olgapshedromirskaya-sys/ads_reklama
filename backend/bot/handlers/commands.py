from __future__ import annotations

import logging

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

settings = get_settings()
logger = logging.getLogger(__name__)

BTN_DRR = "📊 ДРР"
BTN_WEEK_REPORT = "📈 Отчёт за неделю"
BTN_DIAGNOSTICS = "🔍 Диагностика"
BTN_AUTO_MINUS = "🚫 Авто-минусовка"
BTN_CAMPAIGNS = "📦 Кампании"
BTN_NOTIFICATIONS = "🔔 Уведомления"
BTN_OPEN_DASHBOARD = "🚀 Открыть дашборд"


def _build_main_menu() -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = [
        [KeyboardButton(text=BTN_DRR), KeyboardButton(text=BTN_WEEK_REPORT)],
        [KeyboardButton(text=BTN_DIAGNOSTICS), KeyboardButton(text=BTN_AUTO_MINUS)],
        [KeyboardButton(text=BTN_CAMPAIGNS), KeyboardButton(text=BTN_NOTIFICATIONS)],
        [KeyboardButton(text=BTN_OPEN_DASHBOARD)],
    ]
    return ReplyKeyboardMarkup(rows, resize_keyboard=True, is_persistent=True)


def _dashboard_inline_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("✈️ Открыть WebApp", web_app=WebAppInfo(url=settings.webapp_url))]]
    )


async def _send_in_development_message(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text("🔧 Функция в разработке. Скоро будет доступна!")


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    logger.info("Received /start from telegram_id=%s", update.effective_user.id if update.effective_user else None)
    await message.reply_text(
        "👋 Добро пожаловать!\nРеклама маркетплейсов — управление и аналитика",
        reply_markup=_build_main_menu(),
    )


async def dashboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
        "Откройте дашборд в WebApp:",
        reply_markup=_dashboard_inline_keyboard(),
    )


async def _send_drr_report(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
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
    message = update.effective_message
    if message is None:
        return
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    "🚫 Запустить авто-очистку",
                    web_app=WebAppInfo(url=f"{settings.webapp_url.rstrip('/')}/queries"),
                )
            ],
            [InlineKeyboardButton("🚀 Открыть дашборд", web_app=WebAppInfo(url=settings.webapp_url))],
        ]
    )
    await message.reply_text(
        "🔍 Авто-диагностика\n\n"
        "❌ Обнаружено 3 проблемы:\n\n"
        "1. Джинсы slim fit (WB)\n"
        "   CTR 1.0% — низкий\n"
        "   Проверь фото и цену\n\n"
        "2. 7 ключей с 0 продажами\n"
        "   Сливают 12,300₽/день\n\n"
        "3. ДРР 37.7% у кампании\n"
        "   Работаете в убыток\n\n"
        "[🚫 Запустить авто-очистку] [🚀 Открыть дашборд]",
        reply_markup=keyboard,
    )


async def _send_week_report(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
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
        "💡 Рекомендации:\n"
        "- Масштабируй Кроссовки женские — ДРР 8.2%\n"
        "- Останови Джинсы slim fit — ДРР 37.7%\n"
        "- 7 нерелевантных ключей к удалению"
    )


async def _send_auto_minus_result(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    "Применить минус-слова",
                    web_app=WebAppInfo(url=f"{settings.webapp_url.rstrip('/')}/queries"),
                )
            ]
        ]
    )
    await message.reply_text(
        "🤖 Авто-минусовка запущена...\n"
        "Найдено нерелевантных ключей: 19\n"
        "Сливали: 12,300₽/день\n"
        "Сгенерировано минус-слов: 12\n"
        "[Применить минус-слова]",
        reply_markup=keyboard,
    )


async def summary_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_drr_report(update)


async def alerts_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def campaigns_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def pause_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def resume_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def team_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def add_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def remove_employee_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    del context
    await _send_in_development_message(update)


async def text_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if message is None:
        return

    text = (message.text or "").strip()
    if text == BTN_DRR:
        await _send_drr_report(update)
        return
    if text == BTN_DIAGNOSTICS:
        await _send_diagnostics_report(update)
        return
    if text == BTN_WEEK_REPORT:
        await _send_week_report(update)
        return
    if text == BTN_OPEN_DASHBOARD:
        await dashboard_command(update, context)
        return
    if text == BTN_AUTO_MINUS:
        await _send_auto_minus_result(update)
        return
    if text in {BTN_CAMPAIGNS, BTN_NOTIFICATIONS}:
        await _send_in_development_message(update)
        return

    await _send_in_development_message(update)
