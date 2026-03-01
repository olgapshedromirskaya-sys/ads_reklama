import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  getCampaign,
  getCampaignStats,
  listQueries,
  runAutoCleanupCampaign,
  setCampaignAutoMinus
} from "@/api/endpoints";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent } from "@/components/metricUtils";
import { LoadingScreen } from "@/components/LoadingScreen";

export function CampaignDetailPage() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const [chartMetric, setChartMetric] = useState<"impressions" | "clicks" | "orders" | "spend">("spend");
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const campaignQuery = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign(campaignId, 30),
    enabled: Number.isFinite(campaignId)
  });
  const statsQuery = useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: () => getCampaignStats(campaignId, 30),
    enabled: Number.isFinite(campaignId)
  });
  const queriesQuery = useQuery({
    queryKey: ["campaign-queries-top", campaignId],
    queryFn: () => listQueries({ campaign_id: campaignId, limit: 200 }),
    enabled: Number.isFinite(campaignId)
  });

  const toggleAutoMinusMutation = useMutation({
    mutationFn: (enabled: boolean) => setCampaignAutoMinus(campaignId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    }
  });

  const cleanupMutation = useMutation({
    mutationFn: () => runAutoCleanupCampaign(campaignId, { apply_now: true }),
    onSuccess: (result) => {
      setCleanupMessage(
        `✅ Удалено ${result.irrelevant_found} ключей, экономия ${formatCurrency(result.budget_saved)}/день (${formatCurrency(
          result.budget_saved * 30
        )}/месяц)`
      );
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      queryClient.invalidateQueries({ queryKey: ["queries-badge"] });
    }
  });

  if (campaignQuery.isLoading || statsQuery.isLoading || queriesQuery.isLoading) {
    return <LoadingScreen text="Загрузка кампании..." />;
  }
  if (!campaignQuery.data || !statsQuery.data || !queriesQuery.data) {
    return <div className="text-sm text-red-500">Ошибка загрузки кампании.</div>;
  }

  const chartData = statsQuery.data.map((row) => ({
    ...row,
    day: row.date.slice(5)
  }));

  const metrics = useMemo(() => {
    if (!statsQuery.data.length) {
      return {
        impressions: 0,
        clicks: 0,
        orders: 0,
        spend: 0,
        revenue: 0,
        ctr: 0,
        cpc: 0,
        cr: 0,
        drr: 0
      };
    }
    const totals = statsQuery.data.reduce(
      (acc, row) => {
        acc.impressions += row.impressions;
        acc.clicks += row.clicks;
        acc.orders += row.orders;
        acc.spend += row.spend;
        acc.revenue += row.revenue;
        return acc;
      },
      { impressions: 0, clicks: 0, orders: 0, spend: 0, revenue: 0 }
    );
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const cr = totals.clicks > 0 ? (totals.orders / totals.clicks) * 100 : 0;
    const drr = totals.revenue > 0 ? (totals.spend / totals.revenue) * 100 : totals.spend > 0 ? 999 : 0;
    return { ...totals, ctr, cpc, cr, drr };
  }, [statsQuery.data]);

  const warnings = useMemo(() => {
    const items: string[] = [];
    if (metrics.impressions > 50000 && metrics.ctr < 1) {
      items.push("⚠️ Много показов, мало кликов — проверь фото/цену/рейтинг");
    }
    if (metrics.clicks > 500 && metrics.cr < 3) {
      items.push("⚠️ Много кликов, мало заказов — карточка не убеждает");
    }
    if (metrics.drr > 35) {
      items.push("🔴 ДРР выше 35% — кампания убыточна");
    }
    return items;
  }, [metrics]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="text-sm font-semibold">{campaignQuery.data.name}</div>
        <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
          {campaignQuery.data.type || "—"} • {campaignQuery.data.status === "active" ? "Активна" : "На паузе"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MetricCard title="Показы" value={formatInteger(metrics.impressions)} />
        <MetricCard title="Клики" value={formatInteger(metrics.clicks)} />
        <MetricCard title="CTR" value={formatPercent(metrics.ctr, 1)} valueClass={ctrColorClass(metrics.ctr)} />
        <MetricCard title="CPC" value={formatCurrency(metrics.cpc)} />
        <MetricCard title="Заказы" value={formatInteger(metrics.orders)} />
        <MetricCard title="CR" value={formatPercent(metrics.cr, 1)} valueClass={crColorClass(metrics.cr)} />
        <MetricCard title="Расход" value={formatCurrency(metrics.spend)} />
        <MetricCard title="Выручка" value={formatCurrency(metrics.revenue)} />
        <MetricCard title="ДРР" value={formatPercent(metrics.drr, 1)} valueClass={drrColorClass(metrics.drr)} />
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Настройки кампании</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleAutoMinusMutation.mutate(!campaignQuery.data.auto_minus_enabled)}
            className={`rounded-md px-3 py-2 text-xs font-semibold ${
              campaignQuery.data.auto_minus_enabled ? "bg-emerald-600 text-white" : "border border-slate-300/30"
            }`}
          >
            Авто-минусовка {campaignQuery.data.auto_minus_enabled ? "ВКЛ" : "ВЫКЛ"}
          </button>
          <button
            onClick={() => cleanupMutation.mutate()}
            className="rounded-md border border-rose-500/50 px-3 py-2 text-xs font-semibold text-rose-700"
          >
            Авто-очистка
          </button>
          {cleanupMessage && <span className="text-xs text-[color:var(--tg-hint-color)]">{cleanupMessage}</span>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="text-sm font-semibold">Метрики по дням (30 дней)</span>
          {[
            { key: "impressions", label: "Показы" },
            { key: "clicks", label: "Клики" },
            { key: "orders", label: "Заказы" },
            { key: "spend", label: "Расходы" }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setChartMetric(item.key as "impressions" | "clicks" | "orders" | "spend")}
              className={`rounded-md px-2 py-1 text-[11px] ${
                chartMetric === item.key
                  ? "bg-[color:var(--tg-button-color)] text-white"
                  : "border border-slate-300/30 text-[color:var(--tg-hint-color)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => (chartMetric === "spend" ? formatCurrency(Number(value)) : formatInteger(Number(value)))} />
              <Line type="monotone" dataKey={chartMetric} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Предупреждения</div>
        <ul className="space-y-1 text-sm">
          {warnings.length === 0 && <li className="text-[color:var(--tg-hint-color)]">Критичных проблем не обнаружено</li>}
          {warnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Ключевые слова и запросы</div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] table-auto border-collapse text-xs">
            <thead>
              <tr className="bg-slate-500/10">
                <th className="px-2 py-2 text-left">Запрос</th>
                <th className="px-2 py-2">Показы</th>
                <th className="px-2 py-2">Клики</th>
                <th className="px-2 py-2">CTR</th>
                <th className="px-2 py-2">CPC</th>
                <th className="px-2 py-2">Заказы</th>
                <th className="px-2 py-2">CR</th>
                <th className="px-2 py-2">Расход</th>
                <th className="px-2 py-2">Выручка</th>
                <th className="px-2 py-2">ДРР</th>
              </tr>
            </thead>
            <tbody>
              {[...queriesQuery.data]
                .sort((a, b) => b.spend - a.spend)
                .slice(0, 50)
                .map((row) => (
                  <tr key={row.id} className="border-t border-slate-300/20">
                    <td className="px-2 py-2">{row.query}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(row.impressions)}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(row.clicks)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${ctrColorClass(row.ctr)}`}>
                      {formatPercent(row.ctr, 1)}
                    </td>
                    <td className="px-2 py-2 text-center">{formatCurrency(row.cpc)}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(row.orders)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${crColorClass(row.cr)}`}>
                      {formatPercent(row.cr, 1)}
                    </td>
                    <td className="px-2 py-2 text-center">{formatCurrency(row.spend)}</td>
                    <td className="px-2 py-2 text-center">{formatCurrency(row.revenue)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${drrColorClass(row.drr)}`}>
                      {formatPercent(row.drr, 1)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
