import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCampaigns, listQueries, pauseCampaign, type Campaign } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent, marketplaceLabel } from "@/components/metricUtils";
import { buildCampaignFunnelMetrics, campaignsPath, campaignHealthTone, detectCampaignIssues } from "@/data/campaignInsights";
import { MARKETPLACE_ANALYTICS, type MarketplaceId, computeFunnelMetrics } from "@/data/marketplaceAnalytics";

type DashboardTab = "overview" | "positions";
type PositionPeriod = "today" | "yesterday" | "dayBeforeYesterday" | "week";
type AutoMinusTab = "active" | "archive";
type PlacementHistoryMode = "impressions" | "orders" | "bids";

type MinusKeywordRow = {
  id: string;
  keyword: string;
  campaign: string;
  clicks: number;
  orders: number;
  spend: number;
  reason: string;
};

type MinusArchiveRow = {
  id: string;
  phrase: string;
  campaign: string;
  removedAt: string;
  reason: string;
};

type PositionKeywordRow = {
  keyword: string;
  bid: number;
  positionsByDay: [number, number, number, number, number, number, number];
};

type CampaignFunnelDemoData = {
  impressions: string;
  ctr: string;
  ctrBadge: "🟢" | "🟡" | "🔴";
  clicks: string;
  cpc: string;
  cartCr: string;
  cartAdds: string;
  orderCr: string;
  orderCrBadge: "🟢" | "🟡" | "🔴";
  orders: string;
  drr: string;
  drrBadge: "🟢" | "🟡" | "🔴";
  romi: string;
  romiBadge: "🟢" | "🟡" | "🔴";
};

type CampaignBuyoutData = {
  orderedQty: number;
  orderedAmount: number;
  soldQty: number;
  soldAmount: number;
  returnsQty: number;
  returnsAmount: number;
  buyoutPct: number;
};

type TodayBuyoutSummary = {
  orderedQty: number;
  orderedAmount: number;
  soldQty: number;
  soldAmount: number;
  buyoutPct: number;
};

type PlanTargets = {
  monthlyBudget: number;
  monthlyOrders: number;
};

type PlanActuals = {
  spent: number;
  orders: number;
  dayOfMonth: number;
  daysInMonth: number;
  forecastBudget: number;
  forecastOrders: number;
};

type PlacementChannel = {
  bid: number;
  impressions: number;
  clicks: number;
  ctr: number;
  ctrBadge: "🟢" | "🟡" | "🔴";
  adOrders: number;
  adSales: number;
  drr: number;
  drrBadge: "🟢" | "🟡" | "🔴";
};

type PlacementHistoryPoint = {
  date: string;
  searchImpressions: number;
  shelvesImpressions: number;
  searchOrders: number;
  shelvesOrders: number;
  searchBid: number;
  shelvesBid: number;
};

type WbPlacementRow = {
  campaign: string;
  search: PlacementChannel;
  shelves: PlacementChannel;
  history?: PlacementHistoryPoint[];
  conclusion?: string;
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

const DEMO_MINUS_ARCHIVE_ROWS: MinusArchiveRow[] = [
  {
    id: "archive-1",
    phrase: "кроссовки детские",
    campaign: "Кроссовки женские",
    removedAt: "25.02.2026",
    reason: "CTR 0.2%"
  },
  {
    id: "archive-2",
    phrase: "обувь оптом",
    campaign: "Кроссовки женские",
    removedAt: "23.02.2026",
    reason: "0 заказов"
  },
  {
    id: "archive-3",
    phrase: "ремонт обуви",
    campaign: "Кроссовки женские",
    removedAt: "20.02.2026",
    reason: "Нерелевантно"
  },
  {
    id: "archive-4",
    phrase: "платья свадебные",
    campaign: "Платья летние",
    removedAt: "22.02.2026",
    reason: "0 заказов"
  },
  {
    id: "archive-5",
    phrase: "джинсы широкие",
    campaign: "Джинсы slim fit",
    removedAt: "19.02.2026",
    reason: "CTR 0.1%"
  }
];

const POSITION_DEMO_DATA: Record<MarketplaceId, PositionKeywordRow[]> = {
  wb: [
    {
      keyword: "кроссовки женские",
      positionsByDay: [8, 6, 5, 4, 3, 3, 3],
      bid: 220
    },
    {
      keyword: "кроссовки на платформе",
      positionsByDay: [10, 11, 12, 13, 12, 12, 12],
      bid: 180
    },
    {
      keyword: "белые кроссовки",
      positionsByDay: [5, 5, 6, 7, 8, 7, 7],
      bid: 195
    },
    {
      keyword: "кроссовки nike женские",
      positionsByDay: [20, 21, 22, 23, 24, 24, 24],
      bid: 150
    },
    {
      keyword: "платья летние",
      positionsByDay: [9, 8, 7, 6, 5, 5, 5],
      bid: 210
    },
    {
      keyword: "джинсы slim fit",
      positionsByDay: [15, 16, 18, 20, 22, 22, 22],
      bid: 155
    }
  ],
  ozon: [
    {
      keyword: "рюкзак туристический",
      positionsByDay: [12, 11, 10, 9, 8, 8, 8],
      bid: 180
    },
    {
      keyword: "термокружка 450мл",
      positionsByDay: [14, 15, 15, 16, 15, 15, 15],
      bid: 160
    },
    {
      keyword: "куртка зимняя XL",
      positionsByDay: [6, 5, 5, 4, 4, 4, 4],
      bid: 210
    }
  ]
};

const POSITION_WEEK_DATES = ["24.02", "25.02", "26.02", "27.02", "28.02", "01.03", "02.03"] as const;

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

const CAMPAIGN_FUNNEL_DEMO_DATA: Record<string, CampaignFunnelDemoData> = {
  "wb:Кроссовки женские": {
    impressions: "245000",
    ctr: "3.6",
    ctrBadge: "🟢",
    clicks: "8820",
    cpc: "19",
    cartCr: "15",
    cartAdds: "1323",
    orderCr: "5.0",
    orderCrBadge: "🟢",
    orders: "441",
    drr: "8.2",
    drrBadge: "🟢",
    romi: "1116",
    romiBadge: "🟢"
  },
  "wb:Платья летние": {
    impressions: "189000",
    ctr: "3.0",
    ctrBadge: "🟡",
    clicks: "5670",
    cpc: "21",
    cartCr: "12",
    cartAdds: "680",
    orderCr: "3.5",
    orderCrBadge: "🟡",
    orders: "198",
    drr: "17.2",
    drrBadge: "🟡",
    romi: "482",
    romiBadge: "🟡"
  },
  "wb:Джинсы slim fit": {
    impressions: "156000",
    ctr: "1.0",
    ctrBadge: "🔴",
    clicks: "1560",
    cpc: "45",
    cartCr: "6",
    cartAdds: "94",
    orderCr: "2.0",
    orderCrBadge: "🔴",
    orders: "31",
    drr: "37.7",
    drrBadge: "🔴",
    romi: "165",
    romiBadge: "🔴"
  },
  "ozon:Рюкзак туристический": {
    impressions: "120000",
    ctr: "2.1",
    ctrBadge: "🟡",
    clicks: "2520",
    cpc: "31",
    cartCr: "15",
    cartAdds: "378",
    orderCr: "0.4",
    orderCrBadge: "🔴",
    orders: "9",
    drr: "16.4",
    drrBadge: "🟡",
    romi: "510",
    romiBadge: "🟡"
  },
  "ozon:Термокружка 450мл": {
    impressions: "98000",
    ctr: "2.8",
    ctrBadge: "🟡",
    clicks: "2744",
    cpc: "22",
    cartCr: "15",
    cartAdds: "412",
    orderCr: "0.7",
    orderCrBadge: "🔴",
    orders: "18",
    drr: "12.3",
    drrBadge: "🟡",
    romi: "713",
    romiBadge: "🟢"
  },
  "ozon:Куртка зимняя XL": {
    impressions: "130000",
    ctr: "3.2",
    ctrBadge: "🟢",
    clicks: "4160",
    cpc: "19",
    cartCr: "20",
    cartAdds: "832",
    orderCr: "1.3",
    orderCrBadge: "🟡",
    orders: "52",
    drr: "7.1",
    drrBadge: "🟢",
    romi: "1308",
    romiBadge: "🟢"
  }
};

const CAMPAIGN_BUYOUT_DEMO_DATA: Record<string, CampaignBuyoutData> = {
  "wb:Кроссовки женские": {
    orderedQty: 441,
    orderedAmount: 1_985_000,
    soldQty: 374,
    soldAmount: 1_683_000,
    returnsQty: 67,
    returnsAmount: 302_000,
    buyoutPct: 84.8
  },
  "wb:Платья летние": {
    orderedQty: 198,
    orderedAmount: 693_000,
    soldQty: 158,
    soldAmount: 553_000,
    returnsQty: 40,
    returnsAmount: 140_000,
    buyoutPct: 79.8
  },
  "wb:Джинсы slim fit": {
    orderedQty: 31,
    orderedAmount: 186_000,
    soldQty: 21,
    soldAmount: 126_000,
    returnsQty: 10,
    returnsAmount: 60_000,
    buyoutPct: 67.7
  },
  "ozon:Рюкзак туристический": {
    orderedQty: 9,
    orderedAmount: 47_700,
    soldQty: 8,
    soldAmount: 42_400,
    returnsQty: 1,
    returnsAmount: 5_300,
    buyoutPct: 88.9
  },
  "ozon:Термокружка 450мл": {
    orderedQty: 18,
    orderedAmount: 43_200,
    soldQty: 15,
    soldAmount: 36_000,
    returnsQty: 3,
    returnsAmount: 7_200,
    buyoutPct: 83.3
  },
  "ozon:Куртка зимняя XL": {
    orderedQty: 52,
    orderedAmount: 104_000,
    soldQty: 46,
    soldAmount: 92_000,
    returnsQty: 6,
    returnsAmount: 12_000,
    buyoutPct: 88.5
  }
};

const TODAY_BUYOUT_SUMMARY: Record<MarketplaceId, TodayBuyoutSummary> = {
  wb: {
    orderedQty: 287,
    orderedAmount: 1_291_500,
    soldQty: 241,
    soldAmount: 1_084_500,
    buyoutPct: 84
  },
  ozon: {
    orderedQty: 79,
    orderedAmount: 194_900,
    soldQty: 69,
    soldAmount: 170_400,
    buyoutPct: 87.3
  }
};

const PLAN_FACT_DEFAULTS: Record<MarketplaceId, PlanTargets> = {
  wb: {
    monthlyBudget: 350_000,
    monthlyOrders: 850
  },
  ozon: {
    monthlyBudget: 120_000,
    monthlyOrders: 400
  }
};

const PLAN_FACT_ACTUALS: Record<MarketplaceId, PlanActuals> = {
  wb: {
    spent: 163_170,
    orders: 441,
    dayOfMonth: 14,
    daysInMonth: 31,
    forecastBudget: 361_000,
    forecastOrders: 974
  },
  ozon: {
    spent: 38_427,
    orders: 138,
    dayOfMonth: 14,
    daysInMonth: 31,
    forecastBudget: 85_000,
    forecastOrders: 305
  }
};

const WB_PLACEMENT_DATA: WbPlacementRow[] = [
  {
    campaign: "Кроссовки женские",
    search: {
      bid: 220,
      impressions: 180_000,
      clicks: 7_200,
      ctr: 4.0,
      ctrBadge: "🟢",
      adOrders: 380,
      adSales: 322,
      drr: 7.1,
      drrBadge: "🟢"
    },
    shelves: {
      bid: 180,
      impressions: 65_000,
      clicks: 1_620,
      ctr: 2.5,
      ctrBadge: "🟡",
      adOrders: 61,
      adSales: 52,
      drr: 14.8,
      drrBadge: "🟡"
    },
    history: [
      { date: "24.02", searchImpressions: 25_000, shelvesImpressions: 9_000, searchOrders: 54, shelvesOrders: 8, searchBid: 215, shelvesBid: 175 },
      { date: "25.02", searchImpressions: 26_000, shelvesImpressions: 9_200, searchOrders: 57, shelvesOrders: 9, searchBid: 218, shelvesBid: 175 },
      { date: "26.02", searchImpressions: 25_500, shelvesImpressions: 8_800, searchOrders: 55, shelvesOrders: 8, searchBid: 218, shelvesBid: 178 },
      { date: "27.02", searchImpressions: 27_000, shelvesImpressions: 9_500, searchOrders: 60, shelvesOrders: 10, searchBid: 220, shelvesBid: 180 },
      { date: "28.02", searchImpressions: 26_500, shelvesImpressions: 9_100, searchOrders: 58, shelvesOrders: 9, searchBid: 220, shelvesBid: 180 },
      { date: "01.03", searchImpressions: 25_800, shelvesImpressions: 9_300, searchOrders: 56, shelvesOrders: 9, searchBid: 220, shelvesBid: 180 },
      { date: "02.03", searchImpressions: 24_200, shelvesImpressions: 8_100, searchOrders: 40, shelvesOrders: 8, searchBid: 220, shelvesBid: 180 }
    ],
    conclusion:
      "💡 Поиск эффективнее Полок: ДРР 7.1% vs 14.8%. Рекомендуем увеличить ставку поиска и снизить бюджет полок."
  },
  {
    campaign: "Платья летние",
    search: {
      bid: 210,
      impressions: 140_000,
      clicks: 4_200,
      ctr: 3.0,
      ctrBadge: "🟡",
      adOrders: 165,
      adSales: 132,
      drr: 15.8,
      drrBadge: "🟡"
    },
    shelves: {
      bid: 170,
      impressions: 49_000,
      clicks: 1_470,
      ctr: 3.0,
      ctrBadge: "🟡",
      adOrders: 33,
      adSales: 26,
      drr: 21.1,
      drrBadge: "🔴"
    }
  },
  {
    campaign: "Джинсы slim fit",
    search: {
      bid: 155,
      impressions: 110_000,
      clicks: 1_100,
      ctr: 1.0,
      ctrBadge: "🔴",
      adOrders: 22,
      adSales: 15,
      drr: 32.1,
      drrBadge: "🔴"
    },
    shelves: {
      bid: 120,
      impressions: 46_000,
      clicks: 460,
      ctr: 1.0,
      ctrBadge: "🔴",
      adOrders: 9,
      adSales: 6,
      drr: 50.0,
      drrBadge: "🔴"
    }
  }
];

export function DashboardPage({ marketplace }: { marketplace: MarketplaceId }) {
  const data = MARKETPLACE_ANALYTICS[marketplace];
  const accentClass = marketplace === "ozon" ? "text-sky-300" : "text-violet-300";
  const queryClient = useQueryClient();
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");
  const [positionPeriod, setPositionPeriod] = useState<PositionPeriod>("today");
  const [expandFunnelRequest, setExpandFunnelRequest] = useState<{ campaignId: number; requestId: number } | null>(null);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState<number | null>(null);
  const [minusRows, setMinusRows] = useState<Record<MarketplaceId, MinusKeywordRow[]>>(() => ({
    wb: DEMO_MINUS_ROWS.wb.map((row) => ({ ...row })),
    ozon: DEMO_MINUS_ROWS.ozon.map((row) => ({ ...row }))
  }));
  const [minusArchiveRows, setMinusArchiveRows] = useState<MinusArchiveRow[]>(() => DEMO_MINUS_ARCHIVE_ROWS.map((row) => ({ ...row })));
  const [autoMinusTab, setAutoMinusTab] = useState<AutoMinusTab>("active");
  const [removingMinusRows, setRemovingMinusRows] = useState<Record<string, boolean>>({});
  const [autoMinusMessage, setAutoMinusMessage] = useState<string | null>(null);
  const [planTargets, setPlanTargets] = useState<Record<MarketplaceId, PlanTargets>>(() => ({
    wb: { ...PLAN_FACT_DEFAULTS.wb },
    ozon: { ...PLAN_FACT_DEFAULTS.ozon }
  }));
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<{ budget: string; orders: string }>({ budget: "", orders: "" });
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [placementHistoryMode, setPlacementHistoryMode] = useState<PlacementHistoryMode>("impressions");
  const campaignsSectionRef = useRef<HTMLElement | null>(null);
  const campaignRowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  const autoMinusMessageTimeoutRef = useRef<number | null>(null);
  const planMessageTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      if (autoMinusMessageTimeoutRef.current) {
        window.clearTimeout(autoMinusMessageTimeoutRef.current);
      }
      if (planMessageTimeoutRef.current) {
        window.clearTimeout(planMessageTimeoutRef.current);
      }
    };
  }, []);

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
  const positionRows = POSITION_DEMO_DATA[marketplace];
  const periodIndexes = resolvePositionPeriodIndexes(positionPeriod);
  const currentMinusRows = minusRows[marketplace];
  const totalMinusRows = minusRows.wb.length + minusRows.ozon.length;
  const totalMinusSpend = [...minusRows.wb, ...minusRows.ozon].reduce((sum, row) => sum + row.spend, 0);
  const todayBuyout = TODAY_BUYOUT_SUMMARY[marketplace];
  const todayBuyoutMeta = resolveBuyoutMeta(todayBuyout.buyoutPct);

  const planTarget = planTargets[marketplace];
  const planActual = PLAN_FACT_ACTUALS[marketplace];
  const timeProgress = (planActual.dayOfMonth / planActual.daysInMonth) * 100;
  const budgetProgress = planTarget.monthlyBudget > 0 ? (planActual.spent / planTarget.monthlyBudget) * 100 : 0;
  const budgetDeviation = budgetProgress - timeProgress;
  const budgetStatus = resolveBudgetStatus(budgetDeviation);
  const plannedOrdersByToday = Math.round((planTarget.monthlyOrders * planActual.dayOfMonth) / planActual.daysInMonth);
  const ordersProgress = planTarget.monthlyOrders > 0 ? (planActual.orders / planTarget.monthlyOrders) * 100 : 0;
  const ordersDeltaPct = plannedOrdersByToday > 0 ? ((planActual.orders - plannedOrdersByToday) / plannedOrdersByToday) * 100 : 0;
  const ordersStatus = resolveOrdersStatus(ordersDeltaPct);
  const marketplaceCode = marketplace === "wb" ? "WB" : "Ozon";

  const showAutoMinusMessage = (message: string) => {
    setAutoMinusMessage(message);
    if (autoMinusMessageTimeoutRef.current) {
      window.clearTimeout(autoMinusMessageTimeoutRef.current);
    }
    autoMinusMessageTimeoutRef.current = window.setTimeout(() => {
      setAutoMinusMessage((current) => (current === message ? null : current));
    }, 3200);
  };

  const showPlanMessage = (message: string) => {
    setPlanMessage(message);
    if (planMessageTimeoutRef.current) {
      window.clearTimeout(planMessageTimeoutRef.current);
    }
    planMessageTimeoutRef.current = window.setTimeout(() => {
      setPlanMessage((current) => (current === message ? null : current));
    }, 3200);
  };

  const openCampaignFromDiagnostics = (campaignId: number) => {
    setDashboardTab("overview");
    setExpandFunnelRequest({ campaignId, requestId: Date.now() });
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
      showAutoMinusMessage("✅ Нерелевантных ключей больше не найдено");
      return;
    }
    const monthlySavings = totalMinusSpend * 30;
    setMinusRows({ wb: [], ozon: [] });
    showAutoMinusMessage(
      "✅ Готово! Удалено " +
        `${formatInteger(totalMinusRows)} нерелевантных ключей\n` +
        `Экономия: ~${formatInteger(totalMinusSpend)}₽/день (${formatInteger(monthlySavings)}₽/месяц)\n` +
        "Минус-слова добавлены в кампании"
    );
  };

  const addAllMinusWords = () => {
    if (totalMinusRows === 0) {
      showAutoMinusMessage("✅ Все минус-слова уже добавлены");
      return;
    }
    showAutoMinusMessage(`✅ Добавлено ${formatInteger(totalMinusRows)} ключей в минус-слова по кампаниям`);
  };

  const restoreArchiveRow = (rowId: string) => {
    setMinusArchiveRows((prev) => prev.filter((row) => row.id !== rowId));
    showAutoMinusMessage("✅ Фраза восстановлена в кампанию");
  };

  const restoreAllArchiveRows = () => {
    if (!minusArchiveRows.length) {
      showAutoMinusMessage("✅ Архив уже пуст");
      return;
    }
    setMinusArchiveRows([]);
    showAutoMinusMessage("✅ Все фразы восстановлены в кампании");
  };

  const openPlanEditor = () => {
    setPlanDraft({
      budget: String(planTarget.monthlyBudget),
      orders: String(planTarget.monthlyOrders)
    });
    setPlanEditorOpen(true);
  };

  const savePlan = () => {
    const budget = Number(planDraft.budget.replace(/\s+/g, ""));
    const orders = Number(planDraft.orders.replace(/\s+/g, ""));
    if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(orders) || orders <= 0) {
      showPlanMessage("⚠️ Укажите корректные значения плана");
      return;
    }
    setPlanTargets((prev) => ({
      ...prev,
      [marketplace]: {
        monthlyBudget: Math.round(budget),
        monthlyOrders: Math.round(orders)
      }
    }));
    setPlanEditorOpen(false);
    showPlanMessage("✅ План сохранён");
  };

  return (
    <div className="space-y-4">
      <section className="app-card p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDashboardTab("overview")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              dashboardTab === "overview"
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            📊 Обзор
          </button>
          <button
            onClick={() => setDashboardTab("positions")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              dashboardTab === "positions"
                ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            📍 Позиции
          </button>
        </div>
      </section>

      {dashboardTab === "positions" ? (
        <section className="app-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-100">📍 Позиции по ключевым запросам</h2>
            <span className={`text-xs font-semibold ${accentClass}`}>{data.badge}</span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <PeriodButton label="Сегодня" active={positionPeriod === "today"} onClick={() => setPositionPeriod("today")} />
            <PeriodButton label="Вчера" active={positionPeriod === "yesterday"} onClick={() => setPositionPeriod("yesterday")} />
            <PeriodButton
              label="Позавчера"
              active={positionPeriod === "dayBeforeYesterday"}
              onClick={() => setPositionPeriod("dayBeforeYesterday")}
            />
            <PeriodButton label="7 дней" active={positionPeriod === "week"} onClick={() => setPositionPeriod("week")} />
          </div>

          <div className="overflow-x-auto">
            <table className={positionPeriod === "week" ? "min-w-[1080px] text-xs" : "min-w-[680px] text-xs"}>
              <thead className="bg-slate-500/10 text-slate-300">
                {positionPeriod === "week" ? (
                  <tr>
                    <th className="px-2 py-2 text-left">Ключевое слово</th>
                    {POSITION_WEEK_DATES.map((dateLabel) => (
                      <th key={dateLabel} className="px-2 py-2 text-right">
                        {dateLabel}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-left">Мини-тренд</th>
                    <th className="px-2 py-2 text-right">Ставка</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-2 py-2 text-left">Ключевое слово</th>
                    <th className="px-2 py-2 text-right">{positionColumnLabel(positionPeriod)}</th>
                    <th className="px-2 py-2 text-right">Изменение</th>
                    <th className="px-2 py-2 text-right">Ставка</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {positionRows.map((row) => {
                  const current = row.positionsByDay[periodIndexes.currentIndex];
                  const previous = periodIndexes.previousIndex === null ? undefined : row.positionsByDay[periodIndexes.previousIndex];
                  return (
                    <tr key={row.keyword} className="border-t border-slate-500/20">
                      <td className="px-2 py-2 text-slate-100">{row.keyword}</td>
                      {positionPeriod === "week" ? (
                        <>
                          {row.positionsByDay.map((value, index) => (
                            <td key={`${row.keyword}-${POSITION_WEEK_DATES[index]}`} className="px-2 py-2 text-right text-slate-200">
                              {value}
                            </td>
                          ))}
                          <td className="px-2 py-2">
                            <PositionSparkline values={row.positionsByDay} />
                          </td>
                          <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.bid)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-2 text-right text-slate-200">{current}</td>
                          <td className="px-2 py-2 text-right">
                            <PositionChangeIndicator current={current} previous={previous} />
                          </td>
                          <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.bid)}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {!positionRows.length && (
                  <tr>
                    <td colSpan={positionPeriod === "week" ? 10 : 4} className="px-2 py-8 text-center text-slate-400">
                      Нет данных по выбранному периоду
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
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

            <div className="mt-4 rounded-lg border border-slate-400/30 bg-slate-700/10 p-3 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">С рекламы</div>
              <div className="space-y-1 text-slate-100">
                <div>
                  📋 Заказано с рекламы: <span className="font-semibold">{formatInteger(todayBuyout.orderedQty)} шт | {formatCurrency(todayBuyout.orderedAmount)}</span>
                </div>
                <div>
                  ✅ Продано с рекламы: <span className="font-semibold">{formatInteger(todayBuyout.soldQty)} шт | {formatCurrency(todayBuyout.soldAmount)}</span>
                </div>
                <div className={`${todayBuyoutMeta.className}`}>
                  📊 % выкупа: <span className="font-semibold">{formatPercent(todayBuyout.buyoutPct, 1)} {todayBuyoutMeta.emoji}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="app-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-100">📊 План/Факт</h2>
              <span className={`text-xs font-semibold ${accentClass}`}>{data.badge}</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-400/30 bg-slate-700/10 p-3">
                <div className="text-sm font-semibold text-slate-100">💰 Рекламный бюджет {marketplaceCode}:</div>
                <div className="mt-2 text-xs text-slate-300">
                  Потрачено: {formatCurrency(planActual.spent)} из {formatCurrency(planTarget.monthlyBudget)}
                </div>
                <div className="mt-1 font-mono text-xs text-slate-200">
                  [{buildTextProgressBar(budgetProgress)}] {formatPercent(budgetProgress, 1)}
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  День месяца: {planActual.dayOfMonth} из {planActual.daysInMonth} ({formatPercent(timeProgress, 1)} времени прошло)
                </div>
                <div className={`mt-1 text-xs font-semibold ${budgetStatus.className}`}>Статус: {budgetStatus.text}</div>
                <div className="mt-1 text-xs text-slate-200">
                  Прогноз к концу месяца: ~{formatCurrency(planActual.forecastBudget)}
                </div>
              </div>

              <div className="rounded-lg border border-slate-400/30 bg-slate-700/10 p-3">
                <div className="text-sm font-semibold text-slate-100">📦 Заказы {marketplaceCode}:</div>
                <div className="mt-2 text-xs text-slate-300">
                  Получено: {formatInteger(planActual.orders)} из {formatInteger(planTarget.monthlyOrders)}
                </div>
                <div className="mt-1 font-mono text-xs text-slate-200">
                  [{buildTextProgressBar(ordersProgress)}] {formatPercent(ordersProgress, 1)}
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  По плану на {planActual.dayOfMonth}й день: {formatInteger(plannedOrdersByToday)}
                </div>
                <div className={`mt-1 text-xs font-semibold ${ordersStatus.className}`}>Статус: {ordersStatus.text}</div>
                <div className="mt-1 text-xs text-slate-200">
                  Прогноз к концу месяца: ~{formatInteger(planActual.forecastOrders)} {orderWord(planActual.forecastOrders)}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button onClick={openPlanEditor} className="rounded-md border border-slate-300/40 px-3 py-2 text-xs font-semibold">
                ⚙️ Изменить план
              </button>
            </div>

            {planEditorOpen && (
              <div className="mt-3 rounded-lg border border-slate-400/30 bg-slate-700/10 p-3">
                <div className="mb-2 text-xs font-semibold text-slate-200">Редактирование плана</div>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="text-xs text-slate-300">
                    Рекламный бюджет на месяц:
                    <input
                      type="number"
                      inputMode="numeric"
                      value={planDraft.budget}
                      onChange={(event) => setPlanDraft((prev) => ({ ...prev, budget: event.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-400/30 bg-transparent px-2 py-2 text-sm text-slate-100"
                    />
                  </label>
                  <label className="text-xs text-slate-300">
                    Заказы на месяц:
                    <input
                      type="number"
                      inputMode="numeric"
                      value={planDraft.orders}
                      onChange={(event) => setPlanDraft((prev) => ({ ...prev, orders: event.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-400/30 bg-transparent px-2 py-2 text-sm text-slate-100"
                    />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={savePlan} className="rounded-md border border-emerald-300/40 px-3 py-1.5 text-xs text-emerald-200">
                    Сохранить план
                  </button>
                  <button
                    onClick={() => setPlanEditorOpen(false)}
                    className="rounded-md border border-slate-300/40 px-3 py-1.5 text-xs text-slate-200"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {planMessage && <div className="mt-3 text-xs text-emerald-300">{planMessage}</div>}
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
                const expandRequestId = expandFunnelRequest?.campaignId === campaign.id ? expandFunnelRequest.requestId : null;
                return (
                  <DashboardCampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    tone={tone}
                    highlighted={highlightedCampaignId === campaign.id}
                    expandRequestId={expandRequestId}
                    onRef={(element) => {
                      campaignRowRefs.current[campaign.id] = element;
                    }}
                  />
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
            <h2 className="mb-2 text-sm font-bold text-slate-100">🚫 Авто-минусовка</h2>

            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setAutoMinusTab("active")}
                className={`rounded-md border px-3 py-1.5 font-semibold ${
                  autoMinusTab === "active"
                    ? "border-rose-300/60 bg-rose-500/20 text-rose-100"
                    : "border-slate-400/30 text-slate-300"
                }`}
              >
                🚫 Активные
              </button>
              <button
                onClick={() => setAutoMinusTab("archive")}
                className={`rounded-md border px-3 py-1.5 font-semibold ${
                  autoMinusTab === "archive"
                    ? "border-sky-300/60 bg-sky-500/20 text-sky-100"
                    : "border-slate-400/30 text-slate-300"
                }`}
              >
                🗃️ Архив
              </button>
            </div>

            {autoMinusTab === "active" ? (
              <>
                <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                  <div className="font-semibold">🔴 Найдено {formatInteger(totalMinusRows)} нерелевантных ключей</div>
                  <div>Сливают {formatInteger(totalMinusSpend)}₽/день</div>
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
              </>
            ) : (
              <div className="rounded-lg border border-slate-400/30 bg-slate-700/10 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">Архив минус-фраз: {formatInteger(minusArchiveRows.length)}</div>
                  <button onClick={restoreAllArchiveRows} className="rounded-md border border-slate-300/40 px-2 py-1 text-[11px] text-slate-100">
                    [Восстановить все]
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] text-xs">
                    <thead className="text-slate-300">
                      <tr className="border-b border-slate-500/40">
                        <th className="px-2 py-2 text-left">Минус-фраза</th>
                        <th className="px-2 py-2 text-left">Кампания</th>
                        <th className="px-2 py-2 text-left">Дата удаления</th>
                        <th className="px-2 py-2 text-left">Причина</th>
                        <th className="px-2 py-2 text-left">Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {minusArchiveRows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-500/20">
                          <td className="px-2 py-2 text-slate-100">"{row.phrase}"</td>
                          <td className="px-2 py-2 text-slate-200">{row.campaign}</td>
                          <td className="px-2 py-2 text-slate-200">{row.removedAt}</td>
                          <td className="px-2 py-2 text-slate-200">{row.reason}</td>
                          <td className="px-2 py-2">
                            <button onClick={() => restoreArchiveRow(row.id)} className="rounded-md border border-slate-300/40 px-2 py-1 text-[11px]">
                              [Восстановить]
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!minusArchiveRows.length && (
                        <tr>
                          <td colSpan={5} className="px-2 py-6 text-center text-emerald-300">
                            ✅ Архив пуст
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {autoMinusMessage && <div className="mt-3 whitespace-pre-line text-xs text-emerald-300">{autoMinusMessage}</div>}
          </section>

          {marketplace === "wb" && (
            <section className="app-card p-4">
              <h2 className="mb-3 text-sm font-bold text-slate-100">📍 Размещение рекламы</h2>
              <div className="space-y-4">
                {WB_PLACEMENT_DATA.map((placement) => (
                  <div key={placement.campaign} className="rounded-lg border border-slate-400/30 bg-slate-700/10 p-3">
                    <div className="text-sm font-semibold text-slate-100">{placement.campaign}</div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-[760px] text-xs">
                        <thead className="text-slate-300">
                          <tr className="border-b border-slate-500/30">
                            <th className="px-2 py-2 text-left"></th>
                            <th className="px-2 py-2 text-right">🔍 Поиск</th>
                            <th className="px-2 py-2 text-right">📦 Полки</th>
                          </tr>
                        </thead>
                        <tbody>
                          <PlacementMetricRow label="Ставка" searchValue={formatCurrency(placement.search.bid)} shelvesValue={formatCurrency(placement.shelves.bid)} />
                          <PlacementMetricRow
                            label="Показы"
                            searchValue={formatInteger(placement.search.impressions)}
                            shelvesValue={formatInteger(placement.shelves.impressions)}
                          />
                          <PlacementMetricRow
                            label="Клики"
                            searchValue={formatInteger(placement.search.clicks)}
                            shelvesValue={formatInteger(placement.shelves.clicks)}
                          />
                          <PlacementMetricRow
                            label="CTR"
                            searchValue={`${formatPercent(placement.search.ctr, 1)} ${placement.search.ctrBadge}`}
                            shelvesValue={`${formatPercent(placement.shelves.ctr, 1)} ${placement.shelves.ctrBadge}`}
                            searchClass={placementToneClass(placement.search.ctrBadge)}
                            shelvesClass={placementToneClass(placement.shelves.ctrBadge)}
                          />
                          <PlacementMetricRow
                            label="Заказы с рекламы"
                            searchValue={formatInteger(placement.search.adOrders)}
                            shelvesValue={formatInteger(placement.shelves.adOrders)}
                          />
                          <PlacementMetricRow
                            label="Продажи с рекламы"
                            searchValue={formatInteger(placement.search.adSales)}
                            shelvesValue={formatInteger(placement.shelves.adSales)}
                          />
                          <PlacementMetricRow
                            label="ДРР"
                            searchValue={`${formatPercent(placement.search.drr, 1)} ${placement.search.drrBadge}`}
                            shelvesValue={`${formatPercent(placement.shelves.drr, 1)} ${placement.shelves.drrBadge}`}
                            searchClass={placementToneClass(placement.search.drrBadge)}
                            shelvesClass={placementToneClass(placement.shelves.drrBadge)}
                          />
                        </tbody>
                      </table>
                    </div>

                    {placement.history && (
                      <div className="mt-3">
                        <div className="mb-2 flex flex-wrap gap-2 text-xs">
                          <button
                            onClick={() => setPlacementHistoryMode("impressions")}
                            className={`rounded-md border px-2 py-1 ${
                              placementHistoryMode === "impressions"
                                ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-400/30 text-slate-300"
                            }`}
                          >
                            Показы
                          </button>
                          <button
                            onClick={() => setPlacementHistoryMode("orders")}
                            className={`rounded-md border px-2 py-1 ${
                              placementHistoryMode === "orders"
                                ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-400/30 text-slate-300"
                            }`}
                          >
                            Заказы
                          </button>
                          <button
                            onClick={() => setPlacementHistoryMode("bids")}
                            className={`rounded-md border px-2 py-1 ${
                              placementHistoryMode === "bids"
                                ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-400/30 text-slate-300"
                            }`}
                          >
                            Ставки
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          {placementHistoryMode === "bids" ? (
                            <table className="min-w-[560px] text-xs">
                              <thead className="text-slate-300">
                                <tr className="border-b border-slate-500/30">
                                  <th className="px-2 py-2 text-left">Дата</th>
                                  <th className="px-2 py-2 text-right">Поиск ставка</th>
                                  <th className="px-2 py-2 text-right">Полки ставка</th>
                                </tr>
                              </thead>
                              <tbody>
                                {placement.history.map((point) => (
                                  <tr key={`${placement.campaign}-${point.date}-bids`} className="border-b border-slate-500/20">
                                    <td className="px-2 py-2 text-slate-100">{point.date}</td>
                                    <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(point.searchBid)}</td>
                                    <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(point.shelvesBid)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <table className="min-w-[720px] text-xs">
                              <thead className="text-slate-300">
                                <tr className="border-b border-slate-500/30">
                                  <th className="px-2 py-2 text-left">Дата</th>
                                  <th className="px-2 py-2 text-left">Поиск</th>
                                  <th className="px-2 py-2 text-left">Полки</th>
                                </tr>
                              </thead>
                              <tbody>
                                {placement.history.map((point) => (
                                  <tr key={`${placement.campaign}-${point.date}-${placementHistoryMode}`} className="border-b border-slate-500/20">
                                    <td className="px-2 py-2 text-slate-100">{point.date}</td>
                                    <td className="px-2 py-2 text-slate-200">
                                      {placementHistoryMode === "impressions"
                                        ? `${formatInteger(point.searchImpressions)} показов / ${formatInteger(point.searchOrders)} ${orderWord(point.searchOrders)}`
                                        : `${formatInteger(point.searchOrders)} ${orderWord(point.searchOrders)} / ${formatInteger(point.searchImpressions)} показов`}
                                    </td>
                                    <td className="px-2 py-2 text-slate-200">
                                      {placementHistoryMode === "impressions"
                                        ? `${formatInteger(point.shelvesImpressions)} показов / ${formatInteger(point.shelvesOrders)} ${orderWord(point.shelvesOrders)}`
                                        : `${formatInteger(point.shelvesOrders)} ${orderWord(point.shelvesOrders)} / ${formatInteger(point.shelvesImpressions)} показов`}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}

                    {placement.conclusion && <div className="mt-3 text-xs text-emerald-300">{placement.conclusion}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

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
        </>
      )}
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

function DashboardCampaignRow({
  campaign,
  tone,
  highlighted,
  expandRequestId,
  onRef
}: {
  campaign: Campaign;
  tone: ReturnType<typeof campaignHealthTone>;
  highlighted: boolean;
  expandRequestId: number | null;
  onRef: (element: HTMLDivElement | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expandRequestId !== null) {
      setExpanded(true);
    }
  }, [expandRequestId]);

  return (
    <div
      ref={onRef}
      className={`rounded-lg border px-3 py-2 transition-all duration-300 ${
        highlighted ? "border-amber-300/70 bg-amber-500/15 ring-2 ring-amber-300/60" : "border-slate-500/30 bg-slate-700/10"
      }`}
    >
      <button onClick={() => setExpanded((current) => !current)} className="flex w-full items-center justify-between gap-3 text-left text-sm">
        <span className={tone.className}>
          {tone.icon} {campaign.name} — ДРР {formatPercent(campaign.drr, 1)} — {tone.text}
        </span>
        <span className="shrink-0 text-xs text-[color:var(--tg-link-color)]">{expanded ? "[Воронка ▲]" : "[Воронка ▼]"}</span>
      </button>

      <div className={`grid transition-all duration-200 ${expanded ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <CampaignExpandableFunnel campaign={campaign} />
        </div>
      </div>
    </div>
  );
}

function CampaignExpandableFunnel({ campaign }: { campaign: Campaign }) {
  const funnel = resolveCampaignFunnelData(campaign);
  const buyout = resolveCampaignBuyoutData(campaign);
  const buyoutMeta = resolveBuyoutMeta(buyout.buyoutPct);

  return (
    <div className="rounded-lg border border-slate-300/20 bg-slate-700/10 p-3">
      <div className="space-y-1 text-sm">
        <FunnelLine label="👁 Показы" value={`→ ${funnel.impressions}`} />
        <FunnelLine label="↓ CTR" value={`${funnel.ctr}% ${funnel.ctrBadge}`} valueClass={badgeColorClass(funnel.ctrBadge)} />
        <FunnelLine label="👆 Клики" value={`→ ${funnel.clicks} | CPC: ${funnel.cpc}₽`} />
        <FunnelLine label="↓ CR корзины" value={`${funnel.cartCr}%`} />
        <FunnelLine label="🛒 Корзина" value={`→ ${funnel.cartAdds}`} />
        <FunnelLine
          label="↓ CR заказа"
          value={`${funnel.orderCr}% ${funnel.orderCrBadge}`}
          valueClass={badgeColorClass(funnel.orderCrBadge)}
        />
        <FunnelLine label="📦 Заказы" value={`→ ${funnel.orders}`} />
        <FunnelLine label="↓ ДРР" value={`${funnel.drr}% ${funnel.drrBadge}`} valueClass={badgeColorClass(funnel.drrBadge)} />
        <FunnelLine label="📋 Заказано с рекламы" value={`${formatInteger(buyout.orderedQty)} шт | ${formatCurrency(buyout.orderedAmount)}`} />
        <FunnelLine label="✅ Продано с рекламы" value={`${formatInteger(buyout.soldQty)} шт | ${formatCurrency(buyout.soldAmount)}`} />
        <FunnelLine label="↩️ Возвраты" value={`${formatInteger(buyout.returnsQty)} шт | ${formatCurrency(buyout.returnsAmount)}`} />
        <FunnelLine label="📊 % выкупа" value={`${formatPercent(buyout.buyoutPct, 1)} ${buyoutMeta.emoji}`} valueClass={buyoutMeta.className} />
        <FunnelLine label="💬 Статус выкупа" value={buyoutMeta.hint} valueClass={buyoutMeta.className} />
        <FunnelLine label="📊 ROMI" value={`→ ${funnel.romi}% ${funnel.romiBadge}`} valueClass={badgeColorClass(funnel.romiBadge)} />
      </div>
    </div>
  );
}

function FunnelLine({ label, value, valueClass = "text-slate-100" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
      <div className="text-xs text-slate-300">{label}</div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function PlacementMetricRow({
  label,
  searchValue,
  shelvesValue,
  searchClass = "text-slate-200",
  shelvesClass = "text-slate-200"
}: {
  label: string;
  searchValue: string;
  shelvesValue: string;
  searchClass?: string;
  shelvesClass?: string;
}) {
  return (
    <tr className="border-b border-slate-500/20">
      <td className="px-2 py-2 text-slate-300">{label}</td>
      <td className={`px-2 py-2 text-right font-semibold ${searchClass}`}>{searchValue}</td>
      <td className={`px-2 py-2 text-right font-semibold ${shelvesClass}`}>{shelvesValue}</td>
    </tr>
  );
}

function PeriodButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
        active ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-200" : "border-slate-500/30 text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function resolveCampaignFunnelData(campaign: Campaign): CampaignFunnelDemoData {
  const demoData = CAMPAIGN_FUNNEL_DEMO_DATA[campaignFunnelDemoKey(campaign)];
  if (demoData) {
    return demoData;
  }

  const funnel = buildCampaignFunnelMetrics(campaign);
  return {
    impressions: String(Math.round(funnel.impressions)),
    ctr: funnel.ctr.toFixed(1),
    ctrBadge: funnel.ctr >= 3 ? "🟢" : funnel.ctr >= 2 ? "🟡" : "🔴",
    clicks: String(Math.round(funnel.clicks)),
    cpc: String(Math.round(funnel.cpc)),
    cartCr: funnel.cartCr.toFixed(1),
    cartAdds: String(Math.round(funnel.cartAdds)),
    orderCr: funnel.orderCr.toFixed(1),
    orderCrBadge: funnel.orderCr >= 5 ? "🟢" : funnel.orderCr >= 1 ? "🟡" : "🔴",
    orders: String(Math.round(funnel.orders)),
    drr: funnel.drr.toFixed(1),
    drrBadge: funnel.drr <= 10 ? "🟢" : funnel.drr <= 20 ? "🟡" : "🔴",
    romi: funnel.romi.toFixed(0),
    romiBadge: funnel.romi >= 700 ? "🟢" : funnel.romi >= 300 ? "🟡" : "🔴"
  };
}

function resolveCampaignBuyoutData(campaign: Campaign): CampaignBuyoutData {
  const demoData = CAMPAIGN_BUYOUT_DEMO_DATA[campaignFunnelDemoKey(campaign)];
  if (demoData) {
    return demoData;
  }
  const orderedQty = Math.max(1, Math.round(campaign.orders));
  const soldQty = Math.max(0, Math.round(orderedQty * 0.82));
  const returnsQty = Math.max(0, orderedQty - soldQty);
  const soldAmount = Math.max(0, Math.round(campaign.revenue * 0.84));
  const returnsAmount = Math.max(0, Math.round(campaign.revenue - soldAmount));
  return {
    orderedQty,
    orderedAmount: Math.max(soldAmount, Math.round(campaign.revenue)),
    soldQty,
    soldAmount,
    returnsQty,
    returnsAmount,
    buyoutPct: orderedQty > 0 ? (soldQty / orderedQty) * 100 : 0
  };
}

function campaignFunnelDemoKey(campaign: Campaign) {
  const marketplace = campaign.marketplace || "unknown";
  return `${marketplace}:${campaign.name}`;
}

function badgeColorClass(badge: "🟢" | "🟡" | "🔴") {
  if (badge === "🟢") return "text-emerald-300";
  if (badge === "🟡") return "text-amber-300";
  return "text-rose-300";
}

function placementToneClass(badge: "🟢" | "🟡" | "🔴") {
  if (badge === "🟢") return "text-emerald-300";
  if (badge === "🟡") return "text-amber-300";
  return "text-rose-300";
}

function resolveBuyoutMeta(value: number) {
  if (value > 80) {
    return {
      emoji: "🟢",
      className: "text-emerald-300",
      hint: "Хороший выкуп"
    };
  }
  if (value >= 60) {
    return {
      emoji: "🟡",
      className: "text-amber-300",
      hint: "Средний — проверьте описание"
    };
  }
  return {
    emoji: "🔴",
    className: "text-rose-300",
    hint: "Низкий — серьёзная проблема с карточкой"
  };
}

function getIssueKind(issueId: string) {
  return issueId.split("-").slice(1).join("-");
}

function resolvePositionPeriodIndexes(period: PositionPeriod): { currentIndex: number; previousIndex: number | null } {
  if (period === "today") return { currentIndex: 6, previousIndex: 5 };
  if (period === "yesterday") return { currentIndex: 5, previousIndex: 4 };
  if (period === "dayBeforeYesterday") return { currentIndex: 4, previousIndex: null };
  return { currentIndex: 6, previousIndex: 5 };
}

function positionColumnLabel(period: Exclude<PositionPeriod, "week">) {
  if (period === "today") return "Позиция";
  if (period === "yesterday") return "Позиция";
  return "Позиция";
}

function PositionChangeIndicator({ current, previous }: { current: number; previous?: number }) {
  if (typeof previous !== "number") {
    return <span className="font-semibold text-slate-400">→</span>;
  }
  const delta = previous - current;
  if (delta > 0) {
    return <span className="font-semibold text-emerald-300">↑{delta}</span>;
  }
  if (delta < 0) {
    return <span className="font-semibold text-rose-300">↓{Math.abs(delta)}</span>;
  }
  return <span className="font-semibold text-slate-400">→</span>;
}

function PositionSparkline({ values }: { values: number[] }) {
  const width = 92;
  const height = 30;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const points = values.map((value, index) => {
    const x = pad + (innerWidth * index) / Math.max(values.length - 1, 1);
    const y = pad + ((value - min) / range) * innerHeight;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Тренд позиций за 7 дней">
      <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={points.join(" ")} />
      {points.map((point, index) => {
        const [cx, cy] = point.split(",");
        return <circle key={index} cx={cx} cy={cy} r={1.6} fill="#93c5fd" />;
      })}
    </svg>
  );
}

function buildTextProgressBar(progress: number, width = 16) {
  const normalized = Math.max(0, Math.min(100, progress));
  const filled = Math.round((normalized / 100) * width);
  const empty = Math.max(0, width - filled);
  return `${"█".repeat(filled)}${"░".repeat(empty)}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function resolveBudgetStatus(deltaPct: number): { text: string; className: string } {
  if (Math.abs(deltaPct) <= 5) {
    return {
      text: `✅ В норме (отклонение ${formatSignedPercent(deltaPct)})`,
      className: "text-emerald-300"
    };
  }
  if (deltaPct > 5) {
    return {
      text: `🟡 Расход выше темпа (${formatSignedPercent(deltaPct)})`,
      className: "text-amber-300"
    };
  }
  return {
    text: `🟡 Расход ниже темпа (${formatSignedPercent(deltaPct)})`,
    className: "text-amber-300"
  };
}

function resolveOrdersStatus(deltaPct: number): { text: string; className: string } {
  if (deltaPct >= 10) {
    return {
      text: `🟢 Опережаем на ${formatSignedPercent(deltaPct)}`,
      className: "text-emerald-300"
    };
  }
  if (deltaPct >= -10) {
    return {
      text: `✅ В норме (${formatSignedPercent(deltaPct)})`,
      className: "text-emerald-300"
    };
  }
  return {
    text: `🟡 Отстаём на ${formatSignedPercent(deltaPct)}`,
    className: "text-amber-300"
  };
}

function orderWord(count: number) {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return "заказов";
  if (last === 1) return "заказ";
  if (last >= 2 && last <= 4) return "заказа";
  return "заказов";
}
