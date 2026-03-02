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
  romiBenchmarkLabel,
  romiColorClass
} from "@/components/metricUtils";
import {
  MARKETPLACE_ANALYTICS,
  type MarketplaceId,
  computeFunnelMetrics,
  detectDiagnosticIssues
} from "@/data/marketplaceAnalytics";

export function DashboardPage({ marketplace }: { marketplace: MarketplaceId }) {
  const data = MARKETPLACE_ANALYTICS[marketplace];
  const funnel = computeFunnelMetrics(data.funnelRaw);
  const diagnostics = detectDiagnosticIssues(data);
  const articleRows = [...data.articles].sort((a, b) => b.drr - a.drr);
  const accentClass = marketplace === "ozon" ? "text-sky-300" : "text-violet-300";

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
        <div className="mt-3 grid gap-1 text-[11px] text-slate-300">
          <div>CTR = клики / показы × 100%</div>
          <div>CPC = расход / клики</div>
          <div>CR корзины = корзина / клики × 100%</div>
          <div>CR заказа = заказы / клики × 100%</div>
          <div>ДРР = расход / выручка × 100%</div>
          <div>ROMI = (выручка - расход) / расход × 100%</div>
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
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">По артикулам (худшие сверху)</div>
            <table className="min-w-full text-xs">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-500/40">
                  <th className="px-2 py-2 text-left">Артикул</th>
                  <th className="px-2 py-2 text-right">ДРР%</th>
                  <th className="px-2 py-2 text-right">Реклама</th>
                  <th className="px-2 py-2 text-right">Заказы</th>
                  <th className="px-2 py-2 text-right">СРО</th>
                </tr>
              </thead>
              <tbody>
                {articleRows.map((article) => (
                  <tr key={article.sku} className="border-b border-slate-500/20">
                    <td className="px-2 py-2 text-slate-100">
                      {article.name} <span className="text-slate-400">({article.sku})</span>
                    </td>
                    <td className={`px-2 py-2 text-right font-semibold ${drrColorClass(article.drr)}`}>{formatPercent(article.drr, 1)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(article.spend)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">{formatInteger(article.orders)}</td>
                    <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(article.cpo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="app-card p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-100">АВТО-ДИАГНОСТИКА</h2>
        <div className="space-y-2">
          {diagnostics.map((issue) => (
            <div key={issue.id} className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3">
              <div className="text-sm font-semibold text-rose-200">{issue.title}</div>
              <div className="mt-1 text-xs text-slate-200">{issue.cause}</div>
              <div className="mt-1 text-xs text-slate-100">{issue.recommendation}</div>
            </div>
          ))}
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
