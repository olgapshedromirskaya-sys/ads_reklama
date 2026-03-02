import { useEffect } from "react";

export function useTelegramTheme() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }
    webApp.ready();
    webApp.expand();
  }, []);
}
