import { BarChart3, Bell, CircleDollarSign, Megaphone, Search, Settings, Target } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/queries", label: "Queries", icon: Search },
  { to: "/keywords", label: "Keywords", icon: Target },
  { to: "/budget", label: "Budget", icon: CircleDollarSign },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-300/30 bg-[color:var(--tg-bg-color)]">
      <div className="mx-auto grid max-w-3xl grid-cols-7 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-md p-1 text-[10px] ${
                  isActive ? "text-[color:var(--tg-button-color)]" : "text-[color:var(--tg-hint-color)]"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
