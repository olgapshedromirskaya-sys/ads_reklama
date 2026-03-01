import { BarChart3, Bell, CircleDollarSign, Megaphone, Search, Settings, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { type UserRole, listQueries } from "@/api/endpoints";
import { canAccessExtendedFeatures, resolveUserRole } from "@/auth/roles";
import { useAuthStore } from "@/store/auth";

type NavItem = {
  to: string;
  label: string;
  icon: typeof BarChart3;
  roles: UserRole[];
};

const items: NavItem[] = [
  { to: "/dashboard", label: "Дашборд", icon: BarChart3, roles: ["director", "admin", "manager"] },
  { to: "/campaigns", label: "Кампании", icon: Megaphone, roles: ["director", "admin", "manager"] },
  { to: "/queries", label: "Запросы", icon: Search, roles: ["director", "admin"] },
  { to: "/keywords", label: "Ключевые слова", icon: Target, roles: ["director", "admin"] },
  { to: "/budget", label: "Бюджет", icon: CircleDollarSign, roles: ["director", "admin"] },
  { to: "/alerts", label: "Уведомления", icon: Bell, roles: ["director", "admin", "manager"] },
  { to: "/settings", label: "Настройки", icon: Settings, roles: ["director", "admin"] }
];

export function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const role = resolveUserRole(user);
  const extendedAccess = canAccessExtendedFeatures(user);
  const visibleItems = items.filter((item) => item.roles.includes(role));
  const badgeQuery = useQuery({
    queryKey: ["queries-badge"],
    queryFn: () => listQueries({ limit: 2000, sort_by: "date", sort_dir: "desc" }),
    refetchInterval: 2 * 60_000,
    enabled: extendedAccess
  });
  const irrelevantCount = ((badgeQuery.data || []) as Array<{ label?: string; relevance_hint?: string }>).filter(
    (row) => (row.label || row.relevance_hint || "pending") === "not_relevant"
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-300/30 bg-[color:var(--tg-bg-color)]">
      {irrelevantCount > 0 && (
        <div className="mx-auto max-w-3xl border-b border-rose-500/30 bg-rose-500/10 px-2 py-1 text-center text-[10px] font-semibold text-rose-700">
          🔴 {irrelevantCount} нерелевантных запросов
        </div>
      )}
      <div
        className="mx-auto grid max-w-3xl gap-1 px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(visibleItems.length, 1)}, minmax(0, 1fr))` }}
      >
        {visibleItems.map((item) => {
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
