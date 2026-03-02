import type { Campaign, QueryRow } from "@/api/endpoints";
import { formatCurrency, formatInteger, formatPercent } from "@/components/metricUtils";

export type CampaignIssueSeverity = "critical" | "warning" | "info";
export type CampaignIssueActionType = "open" | "pause" | "minus";

export type CampaignIssueAction = {
  type: CampaignIssueActionType;
  label: string;
};

export type CampaignIssue = {
  id: string;
  severity: CampaignIssueSeverity;
  title: string;
  metrics: string;
  cause: string;
  recommendation: string;
  actions: CampaignIssueAction[];
  keyword?: string;
};

export type CampaignIssueGroup = {
  campaign: Campaign;
  issues: CampaignIssue[];
};

export type CampaignFunnelMetrics = {
  impressions: number;
  ctr: number;
  clicks: number;
  cpc: number;
  cartAdds: number;
  cartCr: number;
  orders: number;
  orderCr: number;
  drr: number;
  spend: number;
  revenue: number;
  romi: number;
};

type IssueKind = "low-ctr" | "low-cr" | "high-drr" | "borderline-drr" | "zero-sales-keyword";

const SEVERITY_PRIORITY: Record<CampaignIssueSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2
};

const DEMO_CAMPAIGN_ISSUES: Record<string, IssueKind[]> = {
  "wb:Кроссовки женские": [],
  "wb:Платья летние": ["low-cr"],
  "wb:Джинсы slim fit": ["low-ctr", "low-cr", "high-drr"],
  "ozon:Рюкзак туристический": ["borderline-drr"],
  "ozon:Термокружка 450мл": [],
  "ozon:Куртка зимняя XL": []
};

function issueKey(campaign: Campaign) {
  const marketplace = campaign.marketplace || "unknown";
  return `${marketplace}:${campaign.name}`;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function estimateCartCr(cr: number) {
  if (cr <= 2.5) return 6;
  if (cr <= 4) return 12;
  return 15;
}

function resolveCartAdds(campaign: Campaign) {
  if (typeof campaign.cart_adds === "number" && campaign.cart_adds > 0) {
    return Math.round(campaign.cart_adds);
  }
  return Math.round((campaign.clicks * estimateCartCr(campaign.cr)) / 100);
}

function findZeroSalesKeyword(queryRows: QueryRow[]) {
  return [...queryRows]
    .filter((row) => row.orders === 0 && row.clicks >= 300 && row.spend >= 5_000)
    .sort((left, right) => right.spend - left.spend)[0];
}

function buildIssue(kind: IssueKind, campaign: Campaign, queryRows: QueryRow[]): CampaignIssue | null {
  if (kind === "low-ctr") {
    return {
      id: `${campaign.id}-low-ctr`,
      severity: "warning",
      title: `CTR ${formatPercent(campaign.ctr, 1)} — низкий`,
      metrics: `CTR: ${formatPercent(campaign.ctr, 1)} | Показы: ${formatInteger(campaign.impressions)}`,
      cause: "Причина: фото/цена/рейтинг не цепляют покупателей",
      recommendation: "💡 Обновите главное фото, проверьте цену конкурентов",
      actions: [{ type: "open", label: "Перейти к кампании" }]
    };
  }

  if (kind === "low-cr") {
    return {
      id: `${campaign.id}-low-cr`,
      severity: "warning",
      title: `CR ${formatPercent(campaign.cr, 1)} — карточка не убеждает`,
      metrics: `CR: ${formatPercent(campaign.cr, 1)} | Клики: ${formatInteger(campaign.clicks)} | Заказы: ${formatInteger(campaign.orders)}`,
      cause: "Причина: карточка не убеждает купить",
      recommendation: "💡 Добавьте отзывы, улучшите описание и галерею",
      actions: [{ type: "open", label: "Перейти к кампании" }]
    };
  }

  if (kind === "high-drr") {
    return {
      id: `${campaign.id}-high-drr`,
      severity: "critical",
      title: `ДРР ${formatPercent(campaign.drr, 1)} — убыточна`,
      metrics: `Расход: ${formatCurrency(campaign.spend)} | Выручка: ${formatCurrency(campaign.revenue)}`,
      cause: "Причина: высокая ставка или низкая маржа",
      recommendation: "💡 Снизьте ставку на 30% или поставьте на паузу",
      actions: [
        { type: "open", label: "Перейти к кампании" },
        { type: "pause", label: "Поставить на паузу" }
      ]
    };
  }

  if (kind === "borderline-drr") {
    return {
      id: `${campaign.id}-borderline-drr`,
      severity: "warning",
      title: `ДРР ${formatPercent(campaign.drr, 1)} — на грани`,
      metrics: `Расход: ${formatCurrency(campaign.spend)} | Выручка: ${formatCurrency(campaign.revenue)}`,
      cause: "Причина: ставка высоковата для текущей маржи",
      recommendation: "💡 Снизьте дневной бюджет на 20%",
      actions: [{ type: "open", label: "Перейти к кампании" }]
    };
  }

  const keywordRow = findZeroSalesKeyword(queryRows);
  if (!keywordRow) {
    return null;
  }

  return {
    id: `${campaign.id}-zero-sales-keyword`,
    severity: "warning",
    title: `Ключ "${keywordRow.query}" сливает бюджет`,
    metrics: `${formatInteger(keywordRow.clicks)} кликов, 0 заказов, потрачено ${formatCurrency(keywordRow.spend)}`,
    cause: "Причина: нерелевантный спрос по ключу",
    recommendation: "Рекомендация: Добавить в минус-слова",
    actions: [{ type: "minus", label: "Добавить в минус-слова" }],
    keyword: keywordRow.query
  };
}

export function buildCampaignFunnelMetrics(campaign: Campaign): CampaignFunnelMetrics {
  const cartAdds = resolveCartAdds(campaign);
  const cartCr = campaign.clicks > 0 ? (cartAdds / campaign.clicks) * 100 : 0;
  const romi = campaign.spend > 0 ? ((campaign.revenue - campaign.spend) / campaign.spend) * 100 : 0;

  return {
    impressions: campaign.impressions,
    ctr: campaign.ctr,
    clicks: campaign.clicks,
    cpc: campaign.cpc,
    cartAdds,
    cartCr: round(cartCr, 1),
    orders: campaign.orders,
    orderCr: campaign.cr,
    drr: campaign.drr,
    spend: campaign.spend,
    revenue: campaign.revenue,
    romi: round(romi, 0)
  };
}

export function detectCampaignIssues(campaign: Campaign, queryRows: QueryRow[] = []): CampaignIssue[] {
  const forcedKinds = DEMO_CAMPAIGN_ISSUES[issueKey(campaign)];
  if (forcedKinds) {
    return sortCampaignIssues(
      forcedKinds
        .map((kind) => buildIssue(kind, campaign, queryRows))
        .filter((issue): issue is CampaignIssue => Boolean(issue))
    );
  }

  const kinds: IssueKind[] = [];

  if (campaign.impressions >= 100_000 && campaign.ctr <= 1.2) {
    kinds.push("low-ctr");
  }
  if (campaign.clicks >= 500 && campaign.cr <= 3.5) {
    kinds.push("low-cr");
  }
  if (campaign.drr >= 35) {
    kinds.push("high-drr");
  }
  if (campaign.marketplace === "ozon" && campaign.drr >= 16 && campaign.drr < 35) {
    kinds.push("borderline-drr");
  }
  if (findZeroSalesKeyword(queryRows)) {
    kinds.push("zero-sales-keyword");
  }

  return sortCampaignIssues(
    [...new Set(kinds)]
      .map((kind) => buildIssue(kind, campaign, queryRows))
      .filter((issue): issue is CampaignIssue => Boolean(issue))
  );
}

export function severityPriority(severity: CampaignIssueSeverity) {
  return SEVERITY_PRIORITY[severity];
}

export function sortCampaignIssues(issues: CampaignIssue[]) {
  return [...issues].sort((left, right) => severityPriority(left.severity) - severityPriority(right.severity));
}

export function sortIssueGroups(groups: CampaignIssueGroup[]) {
  return [...groups].sort((left, right) => {
    const leftTop = left.issues[0];
    const rightTop = right.issues[0];
    const leftPriority = leftTop ? severityPriority(leftTop.severity) : 99;
    const rightPriority = rightTop ? severityPriority(rightTop.severity) : 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    if (left.issues.length !== right.issues.length) {
      return right.issues.length - left.issues.length;
    }
    return right.campaign.drr - left.campaign.drr;
  });
}

export function campaignHealthTone(campaign: Campaign) {
  if (campaign.drr >= 30) {
    return { icon: "🔴", text: "убыточна", className: "text-rose-300" };
  }
  if (campaign.drr >= 15) {
    return { icon: "🟡", text: "внимание", className: "text-amber-300" };
  }
  return { icon: "🟢", text: "норм", className: "text-emerald-300" };
}

export function severityEmoji(severity: CampaignIssueSeverity) {
  if (severity === "critical") return "🔴";
  if (severity === "warning") return "🟡";
  return "ℹ️";
}

export function severityClassName(severity: CampaignIssueSeverity) {
  if (severity === "critical") return "border-rose-400/50 bg-rose-500/10 text-rose-200";
  if (severity === "warning") return "border-amber-400/50 bg-amber-500/10 text-amber-100";
  return "border-sky-400/50 bg-sky-500/10 text-sky-100";
}

export function campaignsPath(marketplace?: "wb" | "ozon" | null) {
  return marketplace === "wb" ? "/wb/campaigns" : "/ozon/campaigns";
}

export function campaignDetailPath(campaignId: number, marketplace?: "wb" | "ozon" | null) {
  return `${campaignsPath(marketplace)}/${campaignId}`;
}
