import { type CSSProperties, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export type AppTab = "ozon" | "wb" | "settings" | "auto-bids";

const tabs: Array<{
  id: AppTab;
  label: string;
  activeColor: string;
  clickLog: string;
  touchLog: string;
}> = [
  { id: "ozon", label: "🔵 Ozon", activeColor: "#0c4a6e", clickLog: "Ozon tab clicked", touchLog: "Ozon tab touched" },
  { id: "wb", label: "🟣 WB", activeColor: "#6b21a8", clickLog: "WB tab clicked", touchLog: "WB tab touched" },
  {
    id: "auto-bids",
    label: "🤖 Авто-ставки",
    activeColor: "#4c1d95",
    clickLog: "AutoBids tab clicked",
    touchLog: "AutoBids tab touched"
  },
  {
    id: "settings",
    label: "⚙️ Настройки",
    activeColor: "#334155",
    clickLog: "Settings tab clicked",
    touchLog: "Settings tab touched"
  }
];

export function Layout({
  children,
  demoMode = false,
  activeTab,
  onTabChange
}: {
  children: ReactNode;
  demoMode?: boolean;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  const pageTitle =
    activeTab === "settings"
      ? "⚙️ Настройки"
      : activeTab === "auto-bids"
      ? "🤖 Авто-ставки"
      : "Реклама маркетплейсов";

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
        <div className="mt-2 grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                console.log(tab.clickLog);
                onTabChange(tab.id);
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
                console.log(tab.touchLog);
                onTabChange(tab.id);
              }}
              style={buildTabButtonStyle(activeTab === tab.id, tab.activeColor)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function buildTabButtonStyle(isActive: boolean, activeColor: string): CSSProperties {
  return {
    background: isActive ? activeColor : "transparent",
    color: "white",
    border: `1px solid ${activeColor}`,
    padding: "8px 4px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600
  };
}
