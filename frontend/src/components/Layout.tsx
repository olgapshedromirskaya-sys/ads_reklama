import { type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout({
  children,
  demoMode = false
}: {
  children: ReactNode;
  demoMode?: boolean;
}) {
  const location = useLocation();
  const tabs = [
    { to: "/ozon", label: "🔵 Ozon", activeClass: "text-sky-300 border-sky-300/60" },
    { to: "/wb", label: "🟣 WB", activeClass: "text-violet-300 border-violet-300/60" },
    { to: "/settings", label: "⚙️ Настройки", activeClass: "text-slate-100 border-slate-200/60" }
  ];

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
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `rounded-lg border px-2 py-2 text-center text-xs font-semibold ${
                  isActive ? `${tab.activeClass} bg-slate-600/20` : "border-slate-500/30 text-slate-300"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
