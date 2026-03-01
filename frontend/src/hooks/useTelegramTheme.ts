import { useEffect } from "react";

const TELEGRAM_CSS_MAP: Record<string, string> = {
  bg_color: "--tg-bg-color",
  text_color: "--tg-text-color",
  hint_color: "--tg-hint-color",
  link_color: "--tg-link-color",
  button_color: "--tg-button-color",
  button_text_color: "--tg-button-text-color"
};

export function useTelegramTheme() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }
    webApp.ready();
    webApp.expand();

    Object.entries(TELEGRAM_CSS_MAP).forEach(([tgKey, cssVar]) => {
      const value = webApp.themeParams?.[tgKey];
      if (value) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    });
  }, []);
}
