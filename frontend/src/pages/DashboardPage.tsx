import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardSummary, runAutoCleanupAll } from "@/api/endpoints";
import { canAccessExtendedFeatures } from "@/auth/roles";
import { LoadingScreen } from "@/components/LoadingScreen";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent } from "@/components/metricUtils";
import { useAuthStore } from "@/store/auth";

type DashboardMarketplace = "ozon" | "wb";
type DashboardPeriod = "day" | "month" | "custom";
type ChartMetric = "impressions" | "clicks" | "orders" | "spend";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthIsoDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

function marketplaceLabel(value: DashboardMarketplace) {
  return value === "ozon" ? "Ozon" : "WB";
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const extendedAccess = canAccessExtendedFeatures(user);
  const [marketplace, setMarketplace] = useState<DashboardMarketplace>("ozon");
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [dateFrom, setDateFrom] = useState(firstDayOfMonthIsoDate());
  const [dateTo, setDateTo] = useState(todayIsoDate());
  const [chartMetric, setChartMetric] = useState<ChartMetric>("spend");
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const summaryParams = useMemo(
    () =>
      period === "custom"
        ? { marketplace, period, date_from: dateFrom, date_to: dateTo }
        : { marketplace, period },
    [marketplace, period, dateFrom, dateTo]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary", summaryParams],
    queryFn: () => getDashboardSummary(summaryParams),
    refetchInterval: 60_000
  });

  const cleanupMutation = useMutation({
    mutationFn: () => runAutoCleanupAll({ apply_now: true }),
    onSuccess: (result) => {
      setCleanupMessage(
        `✅ Удалено ${result.irrelevant_found} ключей, экономия ${formatCurrency(result.budget_saved)}/день (${formatCurrency(
          result.budget_saved * 30
        )}/месяц)`
      );
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      queryClient.invalidateQueries({ queryKey: ["queries-badge"] });
    }
  });

  const chartData = useMemo(() => {
    const trend = data?.trend ?? [];
    return trend.map((item) => ({
      ...item,
      d: item.date.slice(5)
    }));
  }, [data?.trend]);

  if (isLoading) {
    return <LoadingScreen text="Загрузка дашборда..." />;
  }

  if (isError || !data) {
    return <div className="text-sm text-red-500">Ошибка загрузки дашборда.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--tg-hint-color)]">Площадка</div>
        <div className="flex flex-wrap gap-2">
          {(["ozon", "wb"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setMarketplace(item)}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                marketplace === item ? "bg-[color:var(--tg-button-color)] text-white" : "border border-slate-300/30"
              }`}
            >
              {marketplaceLabel(item)}
            </button>
          ))}
        </div>

        <div className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--tg-hint-color)]">Период</div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "day", label: "День" },
            { value: "month", label: "Месяц" },
            { value: "custom", label: "Период" }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value as DashboardPeriod)}
              className={`rounded-md px-3 py-2 text-xs font-semibold ${
                period === item.value ? "bg-[color:var(--tg-button-color)] text-white" : "border border-slate-300/30"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <label className="space-y-1">
              <div className="text-[color:var(--tg-hint-color)]">Дата от</div>
              <input
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <div className="text-[color:var(--tg-hint-color)]">Дата до</div>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MetricCard title="Показы" value={formatInteger(data.totals.impressions)} />
        <MetricCard title="Клики" value={formatInteger(data.totals.clicks)} />
        <MetricCard title="CTR" value={formatPercent(data.totals.ctr, 1)} valueClass={ctrColorClass(data.totals.ctr)} />
        <MetricCard title="CPC" value={formatCurrency(data.totals.cpc)} />
        <MetricCard title="Заказы" value={formatInteger(data.totals.orders)} />
        <MetricCard title="CR" value={formatPercent(data.totals.cr, 1)} valueClass={crColorClass(data.totals.cr)} />
        <MetricCard title="Выручка" value={formatCurrency(data.totals.revenue)} />
        <MetricCard title="Расход" value={formatCurrency(data.totals.spend)} />
        <MetricCard title="ДРР" value={formatPercent(data.totals.drr, 1)} valueClass={drrColorClass(data.totals.drr)} />
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-1 text-sm font-semibold">Площадка: {marketplaceLabel(marketplace)}</div>
        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          <InfoRow label="Расход сегодня" value={formatCurrency(data.spend_today)} />
          <InfoRow label="Расход за неделю" value={formatCurrency(data.spend_week)} />
          <InfoRow label="Расход за период" value={formatCurrency(data.spend_month)} />
          <InfoRow label="Заказы с рекламы" value={formatInteger(data.total_orders)} />
        </div>
        <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
          Последняя синхронизация: {data.last_synced_at ? new Date(data.last_synced_at).toLocaleString() : "—"}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="text-sm font-semibold">Динамика по дням</span>
          <div className="flex gap-1 text-xs">
            {[
              { key: "impressions", label: "Показы" },
              { key: "clicks", label: "Клики" },
              { key: "orders", label: "Заказы" },
              { key: "spend", label: "Расходы" }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setChartMetric(item.key as ChartMetric)}
                className={`rounded-md px-2 py-1 ${
                  chartMetric === item.key
                    ? "bg-[color:var(--tg-button-color)] text-white"
                    : "border border-slate-300/30 text-[color:var(--tg-hint-color)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) =>
                  chartMetric === "spend" ? formatCurrency(Number(value)) : formatInteger(Number(value))
                }
              />
              <Line type="monotone" dataKey={chartMetric} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-2 text-sm font-semibold">Авто-диагностика</div>
        <ul className="space-y-1 text-sm">
          {data.diagnostics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {extendedAccess && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4">
          <div className="text-sm font-semibold text-rose-700">
            🔴 Обнаружено {formatInteger(data.irrelevant_alert.count)} нерелевантных запросов — сливают ~
            {formatCurrency(data.irrelevant_alert.wasted_per_day)}/день ({formatCurrency(data.irrelevant_alert.wasted_per_month)}/мес)
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => cleanupMutation.mutate()}
              className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              disabled={cleanupMutation.isPending}
            >
              Запустить авто-очистку
            </button>
            {cleanupMessage && <span className="text-xs text-[color:var(--tg-hint-color)]">{cleanupMessage}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, valueClass = "" }: { title: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-300/30 p-3">
      <div className="text-xs text-[color:var(--tg-hint-color)]">{title}</div>
      <div className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-[color:var(--tg-hint-color)]">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
