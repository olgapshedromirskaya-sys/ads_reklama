import { type MouseEvent, type ReactNode, type TouchEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav, type DashboardRoute } from "./BottomNav";

export function Layout({
  children,
  demoMode = false
}: {
  children: ReactNode;
  demoMode?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardRoute>(() => resolveRouteTab(location.pathname));
  const lastTouchTimeRef = useRef(0);
  const tabs = [
    { to: "/ozon", label: "🔵 Ozon", activeClass: "text-sky-300 border-sky-300/60" },
    { to: "/wb", label: "🟣 WB", activeClass: "text-violet-300 border-violet-300/60" },
    { to: "/settings", label: "⚙️ Настройки", activeClass: "text-slate-100 border-slate-200/60" }
  ] as const;

  useEffect(() => {
    setActiveTab(resolveRouteTab(location.pathname));
  }, [location.pathname]);

  const changeTab = (tab: DashboardRoute) => {
    setActiveTab(tab);
    if (location.pathname !== tab) {
      navigate(tab);
    }
  };

  const handleTabTouchEnd = (tab: DashboardRoute) => (event: TouchEvent<HTMLButtonElement>) => {
    event.preventDefault();
    lastTouchTimeRef.current = Date.now();
    changeTab(tab);
  };

  const handleTabClick = (tab: DashboardRoute) => (event: MouseEvent<HTMLButtonElement>) => {
    if (Date.now() - lastTouchTimeRef.current < 500) {
      return;
    }
    event.preventDefault();
    changeTab(tab);
  };

  const pageTitle = location.pathname === "/queries" ? "📊 Аналитика запросов" : "Реклама маркетплейсов";

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[color:var(--tg-bg-color)] text-[color:var(--tg-text-color)] safe-bottom">
      {demoMode && (
        <div className="pointer-events-none fixed right-3 top-3 z-50">
          <span className="rounded-full bg-yellow-300 px-3 py-1 text-[10px] font-extrabold tracking-wide text-yellow-900 shadow">
            ДЕМО РЕЖИМ
          </span>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-slate-600/40 bg-[#10192f]/95 px-4 py-3 backdrop-blur">
        <div className="text-sm font-semibold">{pageTitle}</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.to}
              type="button"
              onClick={handleTabClick(tab.to)}
              onTouchEnd={handleTabTouchEnd(tab.to)}
              className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors ${
                activeTab === tab.to ? `${tab.activeClass} bg-slate-600/20` : "border-slate-500/30 text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav activeTab={activeTab} onTabChange={changeTab} />
    </div>
  );
}

function resolveRouteTab(pathname: string): DashboardRoute {
  if (pathname.startsWith("/wb")) return "/wb";
  if (pathname.startsWith("/queries")) return "/queries";
  if (pathname.startsWith("/settings")) return "/settings";
  return "/ozon";
}
