import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardSummary, runAutoCleanupAll } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent } from "@/components/metricUtils";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [chartMetric, setChartMetric] = useState<"impressions" | "clicks" | "orders" | "spend">("spend");
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
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
        <div className="mb-1 text-sm font-semibold">Расходы по маркетплейсам</div>
        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          <InfoRow label="Расходы за месяц" value={formatCurrency(data.spend_month)} />
          <InfoRow label="Заказы с рекламы" value={formatInteger(data.total_orders)} />
          <InfoRow label="Расходы WB" value={formatCurrency(data.wb_spend)} />
          <InfoRow label="Расходы Ozon" value={formatCurrency(data.ozon_spend)} />
        </div>
        <div className="text-xs text-[color:var(--tg-hint-color)]">
          Последняя синхронизация: {data.last_synced_at ? new Date(data.last_synced_at).toLocaleString() : "—"}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="text-sm font-semibold">Расходы по дням (30 дней)</span>
          <div className="flex gap-1 text-xs">
            {[
              { key: "impressions", label: "Показы" },
              { key: "clicks", label: "Клики" },
              { key: "orders", label: "Заказы" },
              { key: "spend", label: "Расходы" }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setChartMetric(item.key as "impressions" | "clicks" | "orders" | "spend")}
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
