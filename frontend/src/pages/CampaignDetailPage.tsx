import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCampaign, getCampaignStats, listQueries, pauseCampaign, resumeCampaign, runAutoCleanupCampaign } from "@/api/endpoints";
import { CampaignFunnelPanel } from "@/components/CampaignFunnelPanel";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent, marketplaceLabel } from "@/components/metricUtils";
import {
  campaignsPath,
  campaignDetailPath,
  detectCampaignIssues,
  severityClassName,
  severityEmoji
} from "@/data/campaignInsights";
import { LoadingScreen } from "@/components/LoadingScreen";

type DetailTab = "funnel" | "daily" | "keywords" | "diagnostics";
type ChartMetric = "impressions" | "clicks" | "orders" | "spend" | "drr";

export function CampaignDetailPage() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const [activeTab, setActiveTab] = useState<DetailTab>("funnel");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("spend");
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
    queryFn: () => listQueries({ campaign_id: campaignId, limit: 300 }),
    enabled: Number.isFinite(campaignId)
  });

  const pauseMutation = useMutation({
    mutationFn: (targetCampaignId: number) => pauseCampaign(targetCampaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    }
  });
  const resumeMutation = useMutation({
    mutationFn: (targetCampaignId: number) => resumeCampaign(targetCampaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    }
  });
  const cleanupMutation = useMutation({
    mutationFn: (targetCampaignId: number) => runAutoCleanupCampaign(targetCampaignId, { apply_now: true }),
    onSuccess: (result) => {
      setCleanupMessage(
        `✅ Добавлено ${result.irrelevant_found} ключей в минус-слова, потенциальная экономия ${formatCurrency(result.budget_saved)}/день`
      );
      queryClient.invalidateQueries({ queryKey: ["campaign-queries-top", campaignId] });
    }
  });

  const chartData = useMemo(
    () =>
      (statsQuery.data || []).map((row) => ({
        ...row,
        day: row.date.slice(5)
      })),
    [statsQuery.data]
  );
  const sortedKeywords = useMemo(() => [...(queriesQuery.data || [])].sort((left, right) => right.spend - left.spend), [queriesQuery.data]);
  const issues = useMemo(() => {
    if (!campaignQuery.data) return [];
    return detectCampaignIssues(campaignQuery.data, queriesQuery.data || []);
  }, [campaignQuery.data, queriesQuery.data]);

  if (campaignQuery.isLoading || statsQuery.isLoading || queriesQuery.isLoading) {
    return <LoadingScreen text="Загрузка кампании..." />;
  }
  if (!campaignQuery.data || !statsQuery.data || !queriesQuery.data) {
    return <div className="text-sm text-red-500">Ошибка загрузки кампании.</div>;
  }

  const campaign = campaignQuery.data;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-base font-semibold">{campaign.name}</div>
            <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
              {marketplaceLabel(campaign.marketplace)} • {campaign.status === "active" ? "🟢 Активна" : "⏸️ На паузе"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (campaign.status === "active" ? pauseMutation.mutate(campaign.id) : resumeMutation.mutate(campaign.id))}
              className="rounded-md border border-slate-300/30 px-3 py-2 text-xs font-semibold"
            >
              {campaign.status === "active" ? "Пауза" : "Возобновить"}
            </button>
            <Link
              to={campaignsPath(campaign.marketplace)}
              className="rounded-md border border-slate-300/30 px-3 py-2 text-xs font-semibold"
            >
              Назад к кампаниям
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <TabButton tab="funnel" currentTab={activeTab} onClick={setActiveTab} label="Воронка" />
          <TabButton tab="daily" currentTab={activeTab} onClick={setActiveTab} label="По дням" />
          <TabButton tab="keywords" currentTab={activeTab} onClick={setActiveTab} label="Ключевые слова" />
          <TabButton tab="diagnostics" currentTab={activeTab} onClick={setActiveTab} label="Диагностика" />
        </div>
      </div>

      {activeTab === "funnel" && <CampaignFunnelPanel campaign={campaign} issuesCount={issues.length} />}

      {activeTab === "daily" && (
        <div className="rounded-xl border border-slate-300/30 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {[
              { key: "impressions", label: "Показы" },
              { key: "clicks", label: "Клики" },
              { key: "orders", label: "Заказы" },
              { key: "spend", label: "Расход" },
              { key: "drr", label: "ДРР" }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setChartMetric(item.key as ChartMetric)}
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
                <Tooltip
                  formatter={(value) => {
                    const numericValue = Number(value);
                    if (chartMetric === "spend") return formatCurrency(numericValue);
                    if (chartMetric === "drr") return formatPercent(numericValue, 1);
                    return formatInteger(numericValue);
                  }}
                />
                <Line type="monotone" dataKey={chartMetric} stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "keywords" && (
        <div className="rounded-xl border border-slate-300/30 p-3">
          <div className="mb-2 text-sm font-semibold">Ключевые слова кампании</div>
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] table-auto border-collapse text-xs">
              <thead>
                <tr className="bg-slate-500/10">
                  <th className="px-2 py-2 text-left">Ключ</th>
                  <th className="px-2 py-2">Показы</th>
                  <th className="px-2 py-2">CTR</th>
                  <th className="px-2 py-2">Клики</th>
                  <th className="px-2 py-2">CPC</th>
                  <th className="px-2 py-2">Заказы</th>
                  <th className="px-2 py-2">CR</th>
                  <th className="px-2 py-2">Расход</th>
                  <th className="px-2 py-2">ДРР</th>
                  <th className="px-2 py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.map((row) => {
                  const status = keywordStatus(row);
                  return (
                    <tr key={row.id} className="border-t border-slate-300/20">
                      <td className="px-2 py-2">{row.query}</td>
                      <td className="px-2 py-2 text-center">{formatInteger(row.impressions)}</td>
                      <td className={`px-2 py-2 text-center font-semibold ${ctrColorClass(row.ctr)}`}>{formatPercent(row.ctr, 1)}</td>
                      <td className="px-2 py-2 text-center">{formatInteger(row.clicks)}</td>
                      <td className="px-2 py-2 text-center">{formatCurrency(row.cpc)}</td>
                      <td className="px-2 py-2 text-center">{formatInteger(row.orders)}</td>
                      <td className={`px-2 py-2 text-center font-semibold ${crColorClass(row.cr)}`}>{formatPercent(row.cr, 1)}</td>
                      <td className="px-2 py-2 text-center">{formatCurrency(row.spend)}</td>
                      <td className={`px-2 py-2 text-center font-semibold ${drrColorClass(row.drr)}`}>{formatPercent(row.drr, 1)}</td>
                      <td className={`px-2 py-2 ${status.toneClass}`}>
                        <div>{status.label}</div>
                        <div className="text-[11px] opacity-80">{status.recommendation}</div>
                      </td>
                    </tr>
                  );
                })}
                {!sortedKeywords.length && (
                  <tr>
                    <td colSpan={10} className="px-2 py-8 text-center text-[color:var(--tg-hint-color)]">
                      Нет данных по ключевым словам
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "diagnostics" && (
        <div className="rounded-xl border border-slate-300/30 p-3">
          <div className="mb-2 text-sm font-semibold">Диагностика кампании</div>
          <div className="space-y-2">
            {issues.length === 0 && <div className="text-sm text-emerald-300">Критичных проблем не обнаружено</div>}
            {issues.map((issue) => (
              <div key={issue.id} className={`rounded-lg border p-3 ${severityClassName(issue.severity)}`}>
                <div className="text-sm font-semibold">
                  {severityEmoji(issue.severity)} "{campaign.name}" ({marketplaceLabel(campaign.marketplace)}) — {issue.title}
                </div>
                <div className="mt-1 text-xs">{issue.metrics}</div>
                <div className="mt-1 text-xs">{issue.cause}</div>
                <div className="mt-1 text-xs">{issue.recommendation}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {issue.actions.map((action, index) => {
                    if (action.type === "open") {
                      return (
                        <Link
                          key={`${issue.id}-${action.type}-${index}`}
                          to={campaignDetailPath(campaign.id, campaign.marketplace)}
                          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                        >
                          {action.label}
                        </Link>
                      );
                    }
                    if (action.type === "pause") {
                      return (
                        <button
                          key={`${issue.id}-${action.type}-${index}`}
                          onClick={() => pauseMutation.mutate(campaign.id)}
                          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                        >
                          {action.label}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={`${issue.id}-${action.type}-${index}`}
                        onClick={() => cleanupMutation.mutate(campaign.id)}
                        className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {cleanupMessage && <div className="mt-3 text-xs text-emerald-300">{cleanupMessage}</div>}
        </div>
      )}
    </div>
  );
}

function TabButton({
  tab,
  currentTab,
  onClick,
  label
}: {
  tab: DetailTab;
  currentTab: DetailTab;
  onClick: (tab: DetailTab) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`rounded-md px-3 py-2 text-xs font-semibold ${
        currentTab === tab ? "bg-[color:var(--tg-button-color)] text-white" : "border border-slate-300/30"
      }`}
    >
      {label}
    </button>
  );
}

function keywordStatus(row: {
  clicks: number;
  orders: number;
  drr: number;
  cr: number;
}) {
  if (row.orders === 0 && row.clicks >= 100) {
    return {
      label: "🔴 Нерелевантный",
      recommendation: "Добавить в минус-слова",
      toneClass: "text-rose-300"
    };
  }
  if (row.drr >= 35) {
    return {
      label: "🔴 Убыточный",
      recommendation: "Снизить ставку или остановить",
      toneClass: "text-rose-300"
    };
  }
  if (row.cr <= 3 && row.clicks > 200) {
    return {
      label: "🟡 Низкая конверсия",
      recommendation: "Улучшить карточку товара",
      toneClass: "text-amber-300"
    };
  }
  if (row.drr >= 15) {
    return {
      label: "🟡 Требует внимания",
      recommendation: "Контролировать ставки",
      toneClass: "text-amber-300"
    };
  }
  return {
    label: "🟢 Норм",
    recommendation: "Оставить без изменений",
    toneClass: "text-emerald-300"
  };
}
