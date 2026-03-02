import logging
import os
import time

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

from app.core.config import get_settings
from bot.handlers.commands import (
    add_employee_command,
    alerts_command,
    campaigns_command,
    dashboard_command,
    pause_command,
    remove_employee_command,
    resume_command,
    start_command,
    summary_command,
    team_command,
    text_menu_handler,
)

logger = logging.getLogger(__name__)
RECONNECT_DELAY_SECONDS = 5


def _resolve_bot_token() -> str:
    settings = get_settings()
    candidates = [
        settings.telegram_bot_token,
        os.getenv("TELEGRAM_BOT_TOKEN", ""),
        os.getenv("BOT_TOKEN", ""),
    ]
    for candidate in candidates:
        token = (candidate or "").strip()
        if token:
            return token
    return ""


async def _log_bot_errors(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.error is None:
        logger.error("Неизвестная ошибка бота, update=%s", update)
        return
    logger.error(
        "Ошибка в обработчике Telegram update=%s",
        update,
        exc_info=(type(context.error), context.error, context.error.__traceback__),
    )


def build_application(token: str) -> Application:
    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("dashboard", dashboard_command))
    application.add_handler(CommandHandler("summary", summary_command))
    application.add_handler(CommandHandler("alerts", alerts_command))
    application.add_handler(CommandHandler("campaigns", campaigns_command))
    application.add_handler(CommandHandler("pause", pause_command))
    application.add_handler(CommandHandler("resume", resume_command))
    application.add_handler(CommandHandler("team", team_command))
    application.add_handler(CommandHandler("add_employee", add_employee_command))
    application.add_handler(CommandHandler("remove_employee", remove_employee_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_menu_handler))
    application.add_error_handler(_log_bot_errors)
    return application


def main() -> None:
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

    token = _resolve_bot_token()
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN не задан. Бот не может стартовать.")
        raise RuntimeError("Missing TELEGRAM_BOT_TOKEN")

    logger.info("Bot starting...")
    attempt = 1
    while True:
        try:
            app = build_application(token)
            logger.info("Запуск polling Telegram-бота (попытка %d)", attempt)
            try:
                app.run_polling(drop_pending_updates=True, allowed_updates=Update.ALL_TYPES)
                logger.warning("Polling завершился. Повторный запуск через %d сек.", RECONNECT_DELAY_SECONDS)
            except Exception:
                logger.exception("Ошибка во время run_polling (попытка %d)", attempt)
                raise
        except KeyboardInterrupt:
            logger.info("Остановка Telegram-бота по сигналу KeyboardInterrupt.")
            break
        except Exception:
            logger.exception("Telegram-бот аварийно завершился (попытка %d).", attempt)

        attempt += 1
        time.sleep(RECONNECT_DELAY_SECONDS)


if __name__ == "__main__":
    main()
