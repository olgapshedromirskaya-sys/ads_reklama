from telegram.ext import Application, CommandHandler

from app.core.config import get_settings
from bot.handlers.commands import (
    alerts_command,
    campaigns_command,
    dashboard_command,
    pause_command,
    resume_command,
    start_command,
    summary_command,
)


def build_application() -> Application:
    settings = get_settings()
    application = Application.builder().token(settings.telegram_bot_token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("dashboard", dashboard_command))
    application.add_handler(CommandHandler("summary", summary_command))
    application.add_handler(CommandHandler("alerts", alerts_command))
    application.add_handler(CommandHandler("campaigns", campaigns_command))
    application.add_handler(CommandHandler("pause", pause_command))
    application.add_handler(CommandHandler("resume", resume_command))
    return application


def main() -> None:
    app = build_application()
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
