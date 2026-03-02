import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
  activeClass: string;
};

const items: NavItem[] = [
  { to: "/ozon", label: "🔵 Ozon", activeClass: "text-sky-300" },
  { to: "/wb", label: "🟣 WB", activeClass: "text-violet-300" },
  { to: "/queries", label: "📊 Запросы", activeClass: "text-cyan-300" },
  { to: "/settings", label: "⚙️ Настройки", activeClass: "text-slate-100" }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-500/30 bg-[#0f172a]/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-12 items-center justify-center rounded-lg px-1 text-center text-[11px] font-semibold ${
                isActive ? `${item.activeClass} bg-slate-500/20` : "text-slate-300"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
