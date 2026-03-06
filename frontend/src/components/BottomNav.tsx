import { type CSSProperties } from "react";
import type { AppTab } from "./Layout";

type NavItem = {
  id: AppTab;
  label: string;
  activeColor: string;
  clickLog: string;
  touchLog: string;
};

const items: NavItem[] = [
  { id: "ozon", label: "🔵 Ozon", activeColor: "#0c4a6e", clickLog: "Ozon bottom tab clicked", touchLog: "Ozon bottom tab touched" },
  { id: "wb", label: "🟣 WB", activeColor: "#6b21a8", clickLog: "WB bottom tab clicked", touchLog: "WB bottom tab touched" },
  {
    id: "auto-bids",
    label: "🤖 Авто-ставки",
    activeColor: "#4c1d95",
    clickLog: "AutoBids bottom tab clicked",
    touchLog: "AutoBids bottom tab touched"
  },
  {
    id: "analytics",
    label: "📊 Аналитика",
    activeColor: "#0f766e",
    clickLog: "Analytics bottom tab clicked",
    touchLog: "Analytics bottom tab touched"
  },
  {
    id: "settings",
    label: "⚙️ Настройки",
    activeColor: "#334155",
    clickLog: "Settings bottom tab clicked",
    touchLog: "Settings bottom tab touched"
  }
];

export function BottomNav({
  activeTab,
  onTabChange
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-500/30 bg-[#0f172a]/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2 px-2 py-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              console.log(item.clickLog);
              onTabChange(item.id);
            }}
            onTouchStart={(event) => {
              event.stopPropagation();
              console.log(item.touchLog);
              onTabChange(item.id);
            }}
            style={buildBottomButtonStyle(activeTab === item.id, item.activeColor)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function buildBottomButtonStyle(isActive: boolean, activeColor: string): CSSProperties {
  return {
    background: isActive ? activeColor : "transparent",
    color: "white",
    border: `1px solid ${activeColor}`,
    minHeight: "48px",
    borderRadius: "8px",
    cursor: "pointer",
    padding: "8px 4px",
    fontSize: "11px",
    fontWeight: 600
  };
}
