import type { Campaign } from "@/api/endpoints";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent, romiColorClass } from "@/components/metricUtils";
import { buildCampaignFunnelMetrics } from "@/data/campaignInsights";

export function CampaignFunnelPanel({
  campaign,
  issuesCount = 0
}: {
  campaign: Campaign;
  issuesCount?: number;
}) {
  const funnel = buildCampaignFunnelMetrics(campaign);
  const ctrProblem = funnel.ctr <= 1.2;
  const crProblem = funnel.orderCr <= 3;
  const drrProblem = funnel.drr >= 35;
  const cpcProblem = funnel.cpc >= 40;

  return (
    <div className="rounded-xl border border-slate-300/30 bg-slate-700/10 p-3">
      <div className="mb-3 text-sm font-semibold">ВОРОНКА: {campaign.name}</div>

      <div className="space-y-1 text-sm">
        <FunnelRow label="👁 Показы" value={formatInteger(funnel.impressions)} />
        <FunnelRow
          label="↓ CTR"
          value={`${formatPercent(funnel.ctr, 1)} ${ctrProblem ? "🔴 ← ПРОБЛЕМА" : "🟢"}`}
          valueClass={ctrColorClass(funnel.ctr)}
        />
        <FunnelRow
          label="👆 Клики"
          value={`${formatInteger(funnel.clicks)}    CPC: ${formatCurrency(funnel.cpc)}${cpcProblem ? " 🔴" : ""}`}
          valueClass={cpcProblem ? "text-rose-300" : "text-slate-100"}
        />
        <FunnelRow label="↓ CR корзины" value={formatPercent(funnel.cartCr, 1)} />
        <FunnelRow label="🛒 Корзина" value={formatInteger(funnel.cartAdds)} />
        <FunnelRow
          label="↓ CR заказа"
          value={`${formatPercent(funnel.orderCr, 1)} ${crProblem ? "🔴 ← ПРОБЛЕМА" : "🟢"}`}
          valueClass={crColorClass(funnel.orderCr)}
        />
        <FunnelRow label="📦 Заказы" value={formatInteger(funnel.orders)} />
        <FunnelRow
          label="↓ ДРР"
          value={`${formatPercent(funnel.drr, 1)} ${drrProblem ? "🔴 ← УБЫТОЧНО" : funnel.drr >= 16 ? "🟡" : "🟢"}`}
          valueClass={drrColorClass(funnel.drr)}
        />
        <FunnelRow label="💰 Выручка" value={formatCurrency(funnel.revenue)} />
        <FunnelRow label="📊 ROMI" value={`${formatPercent(funnel.romi, 0)} ${funnel.romi >= 200 ? "🟢" : "🔴"}`} valueClass={romiColorClass(funnel.romi)} />
      </div>

      {issuesCount > 0 && (
        <div className="mt-3 text-xs text-amber-300">⚠️ {issuesCount} проблем обнаружено в этой кампании</div>
      )}
    </div>
  );
}

function FunnelRow({ label, value, valueClass = "text-slate-100" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
      <div className="text-xs text-slate-300">{label}</div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
