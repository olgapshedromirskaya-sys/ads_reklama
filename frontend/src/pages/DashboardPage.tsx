import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCampaigns, listQueries, pauseCampaign, runAutoCleanupCampaign } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  crBenchmarkLabel,
  crColorClass,
  ctrBenchmarkLabel,
  ctrColorClass,
  drrBenchmarkLabel,
  drrColorClass,
  formatCurrency,
  formatInteger,
  formatPercent,
  marketplaceLabel,
  romiBenchmarkLabel,
  romiColorClass
} from "@/components/metricUtils";
import {
  buildCampaignFunnelMetrics,
  campaignDetailPath,
  campaignHealthTone,
  campaignsPath,
  detectCampaignIssues,
  severityClassName,
  severityEmoji,
  sortIssueGroups
} from "@/data/campaignInsights";
import { MARKETPLACE_ANALYTICS, type MarketplaceId, computeFunnelMetrics } from "@/data/marketplaceAnalytics";

export function DashboardPage({ marketplace }: { marketplace: MarketplaceId }) {
  const data = MARKETPLACE_ANALYTICS[marketplace];
  const accentClass = marketplace === "ozon" ? "text-sky-300" : "text-violet-300";
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns()
  });
  const queriesQuery = useQuery({
    queryKey: ["dashboard-queries", marketplace],
    queryFn: () => listQueries({ marketplace, limit: 1000 })
  });

  const pauseMutation = useMutation({
    mutationFn: (campaignId: number) => pauseCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setActionMessage("Кампания поставлена на паузу");
    }
  });
  const minusMutation = useMutation({
    mutationFn: (campaignId: number) => runAutoCleanupCampaign(campaignId, { apply_now: true }),
    onSuccess: (result) => {
      setActionMessage(
        `Минус-слова применены: ${result.irrelevant_found}, экономия ${formatCurrency(result.budget_saved)}/день`
      );
      queryClient.invalidateQueries({ queryKey: ["dashboard-queries", marketplace] });
    }
  });

  if (campaignsQuery.isLoading || queriesQuery.isLoading) {
    return <LoadingScreen text="Загрузка дашборда..." />;
  }
  if (!campaignsQuery.data || !queriesQuery.data) {
    return <div className="text-sm text-red-500">Ошибка загрузки dashboard.</div>;
  }

  const marketplaceCampaigns = campaignsQuery.data.filter((campaign) => campaign.marketplace === marketplace);
  const activeCampaigns = marketplaceCampaigns.filter((campaign) => campaign.status === "active").sort((a, b) => b.drr - a.drr);
  const queryMap = new Map<number, Awaited<ReturnType<typeof listQueries>>>();
  for (const row of queriesQuery.data) {
    const rows = queryMap.get(row.campaign_id) || [];
    rows.push(row);
    queryMap.set(row.campaign_id, rows);
  }

  const issueGroups = sortIssueGroups(
    marketplaceCampaigns
      .map((campaign) => ({
        campaign,
        issues: detectCampaignIssues(campaign, queryMap.get(campaign.id) || [])
      }))
      .filter((row) => row.issues.length > 0)
  );

  const funnelRaw = !marketplaceCampaigns.length
    ? data.funnelRaw
    : marketplaceCampaigns.reduce(
        (acc, campaign) => {
          const campaignFunnel = buildCampaignFunnelMetrics(campaign);
          acc.impressions += campaign.impressions;
          acc.clicks += campaign.clicks;
          acc.spend += campaign.spend;
          acc.cartAdds += campaignFunnel.cartAdds;
          acc.orders += campaign.orders;
          acc.revenue += campaign.revenue;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0, cartAdds: 0, orders: 0, revenue: 0 }
      );
  const funnel = computeFunnelMetrics(funnelRaw);
  const articleRows = [...marketplaceCampaigns].sort((left, right) => right.drr - left.drr);

  return (
    <div className="space-y-4">
      <section className="app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">СЕГОДНЯ</h2>
          <span className={`text-xs font-semibold ${accentClass}`}>{data.badge}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TodayCard title="💰 Выручка" value={formatCurrency(data.today.revenue)} actual={data.today.revenue} plan={data.today.revenuePlan} />
          <TodayCard title="📦 Заказы" value={formatInteger(data.today.orders)} actual={data.today.orders} plan={data.today.ordersPlan} />
          <TodayCard title="📢 Реклама" value={formatCurrency(data.today.adSpend)} actual={data.today.adSpend} plan={data.today.adSpendPlan} />
          <TodayCard
            title="🔄 Конверсия"
            value={formatPercent(data.today.conversion, 1)}
            actual={data.today.conversion}
            plan={data.today.conversionPlan}
          />
        </div>
      </section>

      <section className="app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">📋 Кампании ({activeCampaigns.length} активных)</h2>
          <Link to={campaignsPath(marketplace)} className="text-xs text-[color:var(--tg-link-color)] hover:underline">
            Открыть все →
          </Link>
        </div>
        <div className="space-y-2">
          {activeCampaigns.map((campaign) => {
            const tone = campaignHealthTone(campaign);
            return (
              <Link
                key={campaign.id}
                to={campaignDetailPath(campaign.id, campaign.marketplace)}
                className="flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm hover:border-slate-300/50"
              >
                <span className={tone.className}>
                  {tone.icon} {campaign.name} — ДРР {formatPercent(campaign.drr, 1)} — {tone.text}
                </span>
                <span className="text-[color:var(--tg-link-color)]">→</span>
              </Link>
            );
          })}
          {!activeCampaigns.length && <div className="text-sm text-[color:var(--tg-hint-color)]">Активных кампаний нет</div>}
        </div>
      </section>

      <section className="app-card p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-100">ВОРОНКА</h2>
        <div className="thin-scrollbar overflow-x-auto">
          <div className="flex min-w-[1000px] items-stretch gap-2">
            <FunnelStep title="Показы" value={formatInteger(funnel.impressions)} />
            <FunnelStep title="CTR" value={formatPercent(funnel.ctr, 1)} toneClass={ctrColorClass(funnel.ctr)} subtitle={ctrBenchmarkLabel(funnel.ctr)} />
            <FunnelStep title="Клики" value={formatInteger(funnel.clicks)} />
            <FunnelStep title="CPC" value={formatCurrency(funnel.cpc)} />
            <FunnelStep title="В корзину" value={formatInteger(funnel.cartAdds)} />
            <FunnelStep title="CR корзины" value={formatPercent(funnel.cartCr, 1)} />
            <FunnelStep title="Заказы" value={formatInteger(funnel.orders)} />
            <FunnelStep title="CR" value={formatPercent(funnel.cr, 1)} toneClass={crColorClass(funnel.cr)} subtitle={crBenchmarkLabel(funnel.cr)} />
            <FunnelStep title="Выручка" value={formatCurrency(funnel.revenue)} />
            <FunnelStep title="ДРР" value={formatPercent(funnel.drr, 1)} toneClass={drrColorClass(funnel.drr)} subtitle={drrBenchmarkLabel(funnel.drr)} />
            <FunnelStep title="ROMI" value={formatPercent(funnel.romi, 0)} toneClass={romiColorClass(funnel.romi)} subtitle={romiBenchmarkLabel(funnel.romi)} />
          </div>
        </div>
      </section>

      <section className="app-card p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-100">ДРР</h2>
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex h-36 w-36 items-center justify-center rounded-full border-4 text-2xl font-extrabold ${
                funnel.drr <= 10
                  ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                  : funnel.drr <= 20
                    ? "border-amber-400/60 bg-amber-500/20 text-amber-300"
                    : "border-rose-400/60 bg-rose-500/20 text-rose-300"
              }`}
            >
              {formatPercent(funnel.drr, 1)}
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              <div>🟢 до 10% — отлично</div>
              <div>🟡 10-20% — норма</div>
              <div>🔴 выше 20% — много</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">По кампаниям (худшие сверху)</div>
            <table className="min-w-full text-xs">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-500/40">
                  <th className="px-2 py-2 text-left">Кампания</th>
                  <th className="px-2 py-2 text-right">ДРР%</th>
                  <th className="px-2 py-2 text-right">Реклама</th>
                  <th className="px-2 py-2 text-right">Заказы</th>
                  <th className="px-2 py-2 text-right">CPO</th>
                </tr>
              </thead>
              <tbody>
                {articleRows.map((article) => (
                  <tr key={article.id} className="border-b border-slate-500/20">
                    <td className="px-2 py-2 text-slate-100">
                      {article.name} <span className="text-slate-400">({marketplaceLabel(article.marketplace)})</span>
                    </td>
                    <td className={`px-2 py-2 text-right font-semibold ${drrColorClass(article.drr)}`}>{formatPercent(article.drr, 1)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(article.spend)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">{formatInteger(article.orders)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">
                      {formatCurrency(article.orders > 0 ? article.spend / article.orders : article.spend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="app-card p-4">
        <h2 className="mb-1 text-sm font-bold text-slate-100">АВТО-ДИАГНОСТИКА</h2>
        <div className="mb-3 text-xs text-slate-300">Сортировка: 🔴 Убыточные → 🟡 Проблемные → ℹ️ Требуют внимания</div>
        <div className="space-y-3">
          {issueGroups.map(({ campaign, issues }) => (
            <div key={campaign.id} className="rounded-xl border border-slate-300/30 p-3">
              <div className="mb-2 text-sm font-semibold">
                {campaign.name} <span className="text-xs text-slate-300">({marketplaceLabel(campaign.marketplace)})</span>
              </div>
              <div className="space-y-2">
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
                            onClick={() => minusMutation.mutate(campaign.id)}
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
            </div>
          ))}
          {!issueGroups.length && <div className="text-sm text-emerald-300">Проблем не обнаружено</div>}
        </div>
        {actionMessage && <div className="mt-3 text-xs text-emerald-300">{actionMessage}</div>}
      </section>
    </div>
  );
}

function TodayCard({
  title,
  value,
  actual,
  plan
}: {
  title: string;
  value: string;
  actual: number;
  plan: number;
}) {
  const progress = plan > 0 ? (actual / plan) * 100 : 0;
  const positive = progress >= 100;
  return (
    <div className="rounded-lg border border-slate-500/30 bg-slate-700/10 p-3">
      <div className="text-xs text-slate-300">{title}</div>
      <div className="mt-1 text-xl font-bold text-slate-50">{value}</div>
      <div className={`mt-1 text-xs font-semibold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
        {positive ? "▲" : "▼"} {progress.toFixed(1)}% к плану
      </div>
    </div>
  );
}

function FunnelStep({
  title,
  value,
  subtitle,
  toneClass
}: {
  title: string;
  value: string;
  subtitle?: string;
  toneClass?: string;
}) {
  return (
    <div className="min-w-[145px] rounded-lg border border-slate-500/30 bg-slate-700/10 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-300">{title}</div>
      <div className={`mt-1 text-lg font-bold ${toneClass || "text-slate-100"}`}>{value}</div>
      {subtitle && <div className="mt-1 text-[10px] leading-tight text-slate-300">{subtitle}</div>}
    </div>
  );
}
