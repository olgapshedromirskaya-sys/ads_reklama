import { type MouseEvent, useRef, type TouchEvent } from "react";

type NavItem = {
  to: DashboardRoute;
  label: string;
  activeClass: string;
};

export type DashboardRoute = "/ozon" | "/wb" | "/queries" | "/settings";

const items: NavItem[] = [
  { to: "/ozon", label: "🔵 Ozon", activeClass: "text-sky-300 border-sky-300/60 bg-sky-500/10" },
  { to: "/wb", label: "🟣 WB", activeClass: "text-violet-300 border-violet-300/60 bg-violet-500/10" },
  { to: "/queries", label: "📊 Запросы", activeClass: "text-cyan-300 border-cyan-300/60 bg-cyan-500/10" },
  { to: "/settings", label: "⚙️ Настройки", activeClass: "text-slate-100 border-slate-200/60 bg-slate-500/10" }
];

export function BottomNav({
  activeTab,
  onTabChange
}: {
  activeTab: DashboardRoute;
  onTabChange: (tab: DashboardRoute) => void;
}) {
  const lastTouchTimeRef = useRef(0);

  const handleTouchEnd = (tab: DashboardRoute) => (event: TouchEvent<HTMLButtonElement>) => {
    event.preventDefault();
    lastTouchTimeRef.current = Date.now();
    onTabChange(tab);
  };

  const handleClick = (tab: DashboardRoute) => (event: MouseEvent<HTMLButtonElement>) => {
    if (Date.now() - lastTouchTimeRef.current < 500) {
      return;
    }
    event.preventDefault();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-500/30 bg-[#0f172a]/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={handleClick(item.to)}
            onTouchEnd={handleTouchEnd(item.to)}
            className={`flex min-h-12 items-center justify-center rounded-lg border px-1 text-center text-[11px] font-semibold transition-colors ${
              activeTab === item.to ? item.activeClass : "border-transparent text-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
