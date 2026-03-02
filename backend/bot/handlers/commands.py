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
BTN_PLAN_FACT = "📊 План/Факт"
BTN_AUTO_MINUS = "🚫 Авто-минусовка"
BTN_CAMPAIGNS = "📦 Кампании"
BTN_NOTIFICATIONS = "🔔 Уведомления"
BTN_OPEN_DASHBOARD = "🚀 Открыть дашборд"


def _build_main_menu() -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = [
        [KeyboardButton(text=BTN_DRR), KeyboardButton(text=BTN_WEEK_REPORT)],
        [KeyboardButton(text=BTN_DIAGNOSTICS), KeyboardButton(text=BTN_PLAN_FACT)],
        [KeyboardButton(text=BTN_AUTO_MINUS), KeyboardButton(text=BTN_CAMPAIGNS)],
        [KeyboardButton(text=BTN_NOTIFICATIONS)],
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
    await message.reply_text(
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
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
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


async def _send_plan_fact_report(update: Update) -> None:
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
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
    message = update.effective_message
    if message is None:
        return
    await message.reply_text(
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
    if text == BTN_PLAN_FACT:
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
    if text == BTN_NOTIFICATIONS:
        await _send_in_development_message(update)
        return

    await _send_in_development_message(update)
