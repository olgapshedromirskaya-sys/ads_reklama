import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCampaigns, listQueries, pauseCampaign, type Campaign } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  crColorClass,
  ctrColorClass,
  drrColorClass,
  formatCurrency,
  formatInteger,
  formatPercent,
  marketplaceLabel
} from "@/components/metricUtils";
import {
  buildCampaignFunnelMetrics,
  campaignDetailPath,
  campaignHealthTone,
  campaignsPath,
  detectCampaignIssues
} from "@/data/campaignInsights";
import { MARKETPLACE_ANALYTICS, type MarketplaceId, computeFunnelMetrics } from "@/data/marketplaceAnalytics";

type MinusKeywordRow = {
  id: string;
  keyword: string;
  campaign: string;
  clicks: number;
  orders: number;
  spend: number;
  reason: string;
};

const DEMO_MINUS_ROWS: Record<MarketplaceId, MinusKeywordRow[]> = {
  wb: [
    {
      id: "wb-1",
      keyword: "кроссовки мужские 46",
      campaign: "Кроссовки женские",
      clicks: 1200,
      orders: 0,
      spend: 4800,
      reason: "Нерелевантный пол"
    },
    {
      id: "wb-2",
      keyword: "тапочки домашние",
      campaign: "Кроссовки женские",
      clicks: 890,
      orders: 0,
      spend: 3200,
      reason: "Другая категория"
    },
    {
      id: "wb-3",
      keyword: "сапоги зимние кожаные",
      campaign: "Платья летние",
      clicks: 450,
      orders: 0,
      spend: 2100,
      reason: "Другая категория"
    },
    {
      id: "wb-4",
      keyword: "джинсы оптом",
      campaign: "Джинсы slim fit",
      clicks: 380,
      orders: 0,
      spend: 1900,
      reason: "Оптовый запрос"
    },
    {
      id: "wb-5",
      keyword: "джинсы б/у",
      campaign: "Джинсы slim fit",
      clicks: 290,
      orders: 0,
      spend: 1450,
      reason: "Нецелевой запрос"
    }
  ],
  ozon: [
    {
      id: "ozon-1",
      keyword: "термокружка дешево",
      campaign: "Термокружка 450мл",
      clicks: 410,
      orders: 0,
      spend: 8700,
      reason: "Ценовой фильтр"
    },
    {
      id: "ozon-2",
      keyword: "рюкзак оптом",
      campaign: "Рюкзак туристический",
      clicks: 340,
      orders: 0,
      spend: 3400,
      reason: "Оптовый запрос"
    }
  ]
};

const DIAGNOSTICS_ORDER: Record<string, number> = {
  "high-drr": 0,
  "low-ctr": 1,
  "low-cr": 2,
  "borderline-drr": 3
};

const DIAGNOSTICS_DEMO_KEYS = new Set([
  "wb:Джинсы slim fit:high-drr",
  "wb:Джинсы slim fit:low-ctr",
  "wb:Платья летние:low-cr",
  "ozon:Рюкзак туристический:borderline-drr"
]);

export function DashboardPage({ marketplace }: { marketplace: MarketplaceId }) {
  const data = MARKETPLACE_ANALYTICS[marketplace];
  const accentClass = marketplace === "ozon" ? "text-sky-300" : "text-violet-300";
  const queryClient = useQueryClient();
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(null);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState<number | null>(null);
  const [minusRows, setMinusRows] = useState<Record<MarketplaceId, MinusKeywordRow[]>>(() => ({
    wb: DEMO_MINUS_ROWS.wb.map((row) => ({ ...row })),
    ozon: DEMO_MINUS_ROWS.ozon.map((row) => ({ ...row }))
  }));
  const [removingMinusRows, setRemovingMinusRows] = useState<Record<string, boolean>>({});
  const [autoMinusMessage, setAutoMinusMessage] = useState<string | null>(null);
  const campaignsSectionRef = useRef<HTMLElement | null>(null);
  const campaignRowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
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

  const campaignIssues = new Map<number, ReturnType<typeof detectCampaignIssues>>();
  for (const campaign of marketplaceCampaigns) {
    campaignIssues.set(campaign.id, detectCampaignIssues(campaign, queryMap.get(campaign.id) || []));
  }

  const diagnosticsRows = campaignsQuery.data
    .flatMap((campaign) =>
      detectCampaignIssues(campaign, queryMap.get(campaign.id) || []).map((issue) => ({
        campaign,
        issue,
        issueKind: getIssueKind(issue.id),
        demoKey: `${campaign.marketplace || "unknown"}:${campaign.name}:${getIssueKind(issue.id)}`
      }))
    )
    .filter((row) => row.campaign.marketplace === marketplace)
    .filter((row) => DIAGNOSTICS_ORDER[row.issueKind] !== undefined)
    .filter((row) => DIAGNOSTICS_DEMO_KEYS.has(row.demoKey))
    .sort((left, right) => DIAGNOSTICS_ORDER[left.issueKind] - DIAGNOSTICS_ORDER[right.issueKind]);

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
  const currentMinusRows = minusRows[marketplace];
  const totalMinusRows = minusRows.wb.length + minusRows.ozon.length;
  const totalMinusSpend = [...minusRows.wb, ...minusRows.ozon].reduce((sum, row) => sum + row.spend, 0);

  const toggleCampaignFunnel = (campaignId: number) => {
    setExpandedCampaignId((currentId) => (currentId === campaignId ? null : campaignId));
  };

  const openCampaignFromDiagnostics = (campaignId: number) => {
    setExpandedCampaignId(campaignId);
    setHighlightedCampaignId(campaignId);
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedCampaignId((currentId) => (currentId === campaignId ? null : currentId));
    }, 2200);

    window.requestAnimationFrame(() => {
      const rowElement = campaignRowRefs.current[campaignId];
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        campaignsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const removeMinusRow = (marketplaceId: MarketplaceId, rowId: string) => {
    setAutoMinusMessage(null);
    setRemovingMinusRows((prev) => ({ ...prev, [rowId]: true }));
    window.setTimeout(() => {
      setMinusRows((prev) => ({
        ...prev,
        [marketplaceId]: prev[marketplaceId].filter((row) => row.id !== rowId)
      }));
      setRemovingMinusRows((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    }, 200);
  };

  const removeAllMinusRows = () => {
    if (totalMinusRows === 0) {
      setAutoMinusMessage("✅ Нерелевантных ключей больше не найдено");
      return;
    }
    const monthlySavings = totalMinusSpend * 30;
    setMinusRows({ wb: [], ozon: [] });
    setAutoMinusMessage(
      "✅ Готово! Удалено " +
        `${formatCommaNumber(totalMinusRows)} нерелевантных ключей\n` +
        `Экономия: ~${formatCommaNumber(totalMinusSpend)}₽/день (${formatCommaNumber(monthlySavings)}₽/месяц)\n` +
        "Минус-слова добавлены в кампании"
    );
  };

  const addAllMinusWords = () => {
    if (totalMinusRows === 0) {
      setAutoMinusMessage("✅ Все минус-слова уже добавлены");
      return;
    }
    setAutoMinusMessage(`✅ Добавлено ${formatCommaNumber(totalMinusRows)} ключей в минус-слова по кампаниям`);
  };

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

      <section ref={campaignsSectionRef} className="app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">📋 Кампании ({activeCampaigns.length} активных)</h2>
          <Link to={campaignsPath(marketplace)} className="text-xs text-[color:var(--tg-link-color)] hover:underline">
            Открыть все →
          </Link>
        </div>
        <div className="space-y-2">
          {activeCampaigns.map((campaign) => {
            const tone = campaignHealthTone(campaign);
            const expanded = expandedCampaignId === campaign.id;
            const issues = campaignIssues.get(campaign.id) || [];
            return (
              <div
                key={campaign.id}
                ref={(element) => {
                  campaignRowRefs.current[campaign.id] = element;
                }}
                className={`rounded-lg border px-3 py-2 transition-all duration-300 ${
                  highlightedCampaignId === campaign.id
                    ? "border-amber-300/70 bg-amber-500/15 ring-2 ring-amber-300/60"
                    : "border-slate-500/30 bg-slate-700/10"
                }`}
              >
                <button
                  onClick={() => toggleCampaignFunnel(campaign.id)}
                  className="flex w-full items-center justify-between gap-3 text-left text-sm"
                >
                  <span className={tone.className}>
                    {tone.icon} {campaign.name} — ДРР {formatPercent(campaign.drr, 1)} — {tone.text}
                  </span>
                  <span className="shrink-0 text-xs text-[color:var(--tg-link-color)]">
                    {expanded ? "[Свернуть ▲]" : "[Развернуть ▼]"}
                  </span>
                </button>

                <div className={`grid transition-all duration-200 ${expanded ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <CampaignExpandableFunnel campaign={campaign} issues={issues} />
                  </div>
                </div>
              </div>
            );
          })}
          {!activeCampaigns.length && <div className="text-sm text-[color:var(--tg-hint-color)]">Активных кампаний нет</div>}
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
        <h2 className="mb-1 text-sm font-bold text-slate-100">🚫 Авто-минусовка</h2>
        <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          <div className="font-semibold">🔴 Найдено {formatCommaNumber(totalMinusRows)} нерелевантных ключей</div>
          <div>Сливают {formatCommaNumber(totalMinusSpend)}₽/день</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={removeAllMinusRows} className="rounded-md border border-rose-300/40 px-2 py-1 text-[11px]">
              [Удалить все]
            </button>
            <button onClick={addAllMinusWords} className="rounded-md border border-rose-300/40 px-2 py-1 text-[11px]">
              [Добавить все в минус-слова]
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[980px] text-xs">
            <thead className="text-slate-300">
              <tr className="border-b border-slate-500/40">
                <th className="px-2 py-2 text-left">Ключевое слово</th>
                <th className="px-2 py-2 text-left">Кампания</th>
                <th className="px-2 py-2 text-right">Клики</th>
                <th className="px-2 py-2 text-right">Заказы</th>
                <th className="px-2 py-2 text-right">Расход</th>
                <th className="px-2 py-2 text-left">Причина</th>
                <th className="px-2 py-2 text-left">Действие</th>
              </tr>
            </thead>
            <tbody>
              {currentMinusRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-500/20 transition-all duration-200 ${
                    removingMinusRows[row.id] ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"
                  }`}
                >
                  <td className="px-2 py-2 text-slate-100">"{row.keyword}"</td>
                  <td className="px-2 py-2 text-slate-200">{row.campaign}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.clicks)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.orders)}</td>
                  <td className="px-2 py-2 text-right text-rose-200">{formatCurrency(row.spend)}</td>
                  <td className="px-2 py-2 text-slate-200">{row.reason}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeMinusRow(marketplace, row.id)}
                      className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                    >
                      [Удалить]
                    </button>
                  </td>
                </tr>
              ))}
              {!currentMinusRows.length && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-emerald-300">
                    ✅ Нерелевантные ключи для {marketplaceLabel(marketplace)} удалены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {autoMinusMessage && <div className="mt-3 whitespace-pre-line text-xs text-emerald-300">{autoMinusMessage}</div>}
      </section>

      <section className="app-card p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-100">🔍 Авто-диагностика — обнаружено {diagnosticsRows.length} проблемы</h2>
        <div className="space-y-3">
          {diagnosticsRows.map(({ campaign, issue }) => (
            <div key={issue.id} className="rounded-lg border border-slate-300/30 bg-slate-700/10 p-3">
              <div className="text-sm font-semibold text-rose-200">
                ❌ "{campaign.name}" ({marketplaceLabel(campaign.marketplace)}) — {issue.title}
              </div>
              <div className="mt-1 text-xs text-slate-200">{issue.cause}</div>
              <div className="mt-1 text-xs text-emerald-200">{issue.recommendation}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => openCampaignFromDiagnostics(campaign.id)}
                  className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                >
                  [Перейти к кампании ↑]
                </button>
                {issue.actions.some((action) => action.type === "pause") && (
                  <button
                    onClick={() => pauseMutation.mutate(campaign.id)}
                    disabled={pauseMutation.isPending || campaign.status === "paused"}
                    className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    [На паузу ⏸]
                  </button>
                )}
              </div>
            </div>
          ))}
          {!diagnosticsRows.length && <div className="text-sm text-emerald-300">Проблем не обнаружено</div>}
        </div>
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

function CampaignExpandableFunnel({ campaign, issues }: { campaign: Campaign; issues: ReturnType<typeof detectCampaignIssues> }) {
  const funnel = buildCampaignFunnelMetrics(campaign);
  const issuesSummary = Array.from(new Set(issues.map((issue) => issueSummary(issue.id, campaign)).filter(Boolean)));
  const cpcTone = cpcHint(funnel.cpc);

  return (
    <div className="rounded-lg border border-slate-300/20 bg-slate-700/10 p-3">
      <div className="space-y-1 text-sm">
        <FunnelLine label="👁 Показы" value={formatInteger(funnel.impressions)} />
        <FunnelLine label="↓ CTR" value={`${formatPercent(funnel.ctr, 1)} ${ctrHint(funnel.ctr)}`} valueClass={ctrColorClass(funnel.ctr)} />
        <FunnelLine
          label="👆 Клики"
          value={`${formatInteger(funnel.clicks)} | CPC: ${formatCurrency(funnel.cpc)} ${cpcTone}`}
          valueClass={funnel.cpc >= 40 ? "text-rose-300" : funnel.cpc >= 24 ? "text-amber-300" : "text-emerald-300"}
        />
        <FunnelLine label="↓ CR корзины" value={formatPercent(funnel.cartCr, 1)} />
        <FunnelLine label="🛒 Корзина" value={formatInteger(funnel.cartAdds)} />
        <FunnelLine
          label="↓ CR заказа"
          value={`${formatPercent(funnel.orderCr, 1)} ${orderCrHint(funnel.orderCr)}`}
          valueClass={crColorClass(funnel.orderCr)}
        />
        <FunnelLine label="📦 Заказы" value={formatInteger(funnel.orders)} />
        <FunnelLine
          label="↓ ДРР"
          value={`${formatPercent(funnel.drr, 1)} ${drrHint(funnel.drr)}`}
          valueClass={drrColorClass(funnel.drr)}
        />
        <FunnelLine label="💰 Выручка" value={formatCurrency(funnel.revenue)} />
        <FunnelLine
          label="📊 ROMI"
          value={`${formatPercent(funnel.romi, 0)} ${romiHint(funnel.romi)}`}
          valueClass={romiToneClass(funnel.romi)}
        />
      </div>

      <div
        className={`mt-3 rounded-md border p-2 text-xs font-semibold ${
          issuesSummary.length > 0
            ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
            : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
        }`}
      >
        {issuesSummary.length > 0
          ? `⚠️ ${issuesSummary.length} ${problemWord(issuesSummary.length)} в этой кампании`
          : "✅ Проблем не обнаружено"}
      </div>

      <div className="mt-3">
        <Link
          to={campaignDetailPath(campaign.id, campaign.marketplace)}
          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
        >
          Перейти к кампании →
        </Link>
      </div>
    </div>
  );
}

function FunnelLine({ label, value, valueClass = "text-slate-100" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
      <div className="text-xs text-slate-300">{label}</div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function ctrHint(ctr: number) {
  if (ctr <= 1.2) return "🔴 ⚠️ Низкий — обновите фото/цену";
  if (ctr <= 3) return "🟡";
  return "🟢";
}

function cpcHint(cpc: number) {
  if (cpc >= 40) return "🔴";
  if (cpc >= 24) return "🟡";
  return "🟢";
}

function orderCrHint(cr: number) {
  if (cr <= 3) return "🔴 ⚠️ Низкая конверсия";
  if (cr < 5) return "🟡 ⚠️ Можно улучшить";
  return "🟢";
}

function drrHint(drr: number) {
  if (drr >= 30) return "🔴 ⚠️ Убыточно";
  if (drr >= 15) return "🟡";
  return "🟢";
}

function romiHint(romi: number) {
  if (romi >= 700) return "🟢";
  if (romi >= 300) return "🟡";
  return "🔴";
}

function romiToneClass(romi: number) {
  if (romi >= 700) return "text-emerald-300";
  if (romi >= 300) return "text-amber-300";
  return "text-rose-300";
}

function getIssueKind(issueId: string) {
  return issueId.split("-").slice(1).join("-");
}

function issueSummary(issueId: string, campaign: Campaign) {
  const issueKind = getIssueKind(issueId);
  if (issueKind === "low-ctr") {
    return `❌ CTR ${formatPercent(campaign.ctr, 1)} — обновите фото/цену`;
  }
  if (issueKind === "low-cr") {
    return `❌ CR ${formatPercent(campaign.cr, 1)} — карточка не убеждает`;
  }
  if (issueKind === "high-drr") {
    return `❌ ДРР ${formatPercent(campaign.drr, 1)} — снизьте ставки`;
  }
  if (issueKind === "borderline-drr") {
    return `⚠️ ДРР ${formatPercent(campaign.drr, 1)} — снизьте дневной бюджет`;
  }
  return "";
}

function problemWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "проблема";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "проблемы";
  return "проблем";
}

function formatCommaNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}
