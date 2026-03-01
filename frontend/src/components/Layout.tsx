import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/campaigns": "Campaigns",
  "/queries": "Search Queries",
  "/keywords": "Keyword Positions",
  "/budget": "Budget Rules",
  "/alerts": "Alerts",
  "/settings": "Settings"
};

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/campaigns/")) {
    return "Campaign Detail";
  }
  return titleMap[pathname] || "MP Ads Manager";
}

function shouldShowBack(pathname: string) {
  return pathname.startsWith("/campaigns/") && pathname !== "/campaigns";
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const backVisible = shouldShowBack(location.pathname);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }
    const onBack = () => navigate(-1);
    if (backVisible) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(onBack);
    }
    return () => {
      webApp.BackButton.offClick(onBack);
    };
  }, [backVisible, navigate]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[color:var(--tg-bg-color)] text-[color:var(--tg-text-color)] safe-bottom">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-300/30 bg-[color:var(--tg-bg-color)] px-4 py-3">
        {backVisible && (
          <button onClick={() => navigate(-1)} className="rounded-md p-1 text-[color:var(--tg-text-color)]">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="text-sm font-semibold">{resolveTitle(location.pathname)}</div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
