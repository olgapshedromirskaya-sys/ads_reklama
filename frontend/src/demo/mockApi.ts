type Marketplace = "wb" | "ozon";
type QueryLabel = "relevant" | "not_relevant" | "pending";

export type DemoCampaign = {
  id: number;
  account_id: number;
  external_id: string;
  name: string;
  type: string;
  status: "active" | "paused";
  daily_budget: number;
  auto_minus_enabled: boolean;
  marketplace: Marketplace;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  orders: number;
  cr: number;
  revenue: number;
  drr: number;
  spend: number;
  created_at: string;
  updated_at: string;
};

export type DemoCampaignStat = {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpo: number;
  drr: number;
  cr: number;
};

export type DemoDashboardSummary = {
  spend_today: number;
  spend_week: number;
  spend_month: number;
  total_orders: number;
  avg_drr: number;
  wb_spend: number;
  ozon_spend: number;
  last_synced_at: string;
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    orders: number;
    cr: number;
    revenue: number;
    drr: number;
    spend: number;
  };
  trend: Array<{
    date: string;
    impressions: number;
    clicks: number;
    orders: number;
    spend: number;
  }>;
  diagnostics: string[];
  irrelevant_alert: {
    count: number;
    wasted_per_day: number;
    wasted_per_month: number;
  };
};

export type DemoQueryRow = {
  id: number;
  campaign_id: number;
  query: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  ctr: number;
  cpc: number;
  cpo: number;
  cr: number;
  revenue: number;
  drr: number;
  relevance_hint: QueryLabel;
  label: QueryLabel;
  campaign_name: string;
  marketplace: Marketplace;
};

type DemoCleanupQuery = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  orders: number;
  spend: number;
  revenue: number;
  drr: number;
  rules_triggered: string[];
};

type DemoCleanupResult = {
  campaign_id: number;
  campaign_name: string;
  auto_minus_enabled: boolean;
  irrelevant_found: number;
  minus_words: string[];
  budget_wasted: number;
  budget_saved: number;
  auto_applied: boolean;
  apply_failed: number;
  queries: DemoCleanupQuery[];
};

export type DemoAlert = {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  campaign_id?: number | null;
};

export type DemoAccount = {
  id: number;
  marketplace: Marketplace;
  name: string;
  is_active: boolean;
  needs_reconnection: boolean;
  last_synced_at: string;
  created_at: string;
};

export type DemoBudgetRule = {
  id: number;
  campaign_id: number;
  rule_type: string;
  threshold: number;
  action: string;
  is_active: boolean;
};

export type DemoWatchlistItem = {
  id: number;
  account_id: number;
  article_id: string;
  keyword: string;
  target_position?: number | null;
};

export type DemoWatchlistPosition = {
  date: string;
  organic_position?: number | null;
  paid_position?: number | null;
};

export type DemoTrendPoint = {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
};

const DAILY_SPEND_VALUES = [
  22147, 23336, 25074, 26411, 25687, 27043, 28260, 27666, 26895, 29022, 30202, 29626, 27972, 27378, 28725,
  31289, 32738, 31967, 30638, 29319, 26699, 25194, 24693, 25910, 28065, 29709, 31697, 33110, 30945, 29903
];

export const DEMO_MINUS_WORDS = [
  "мужские",
  "тапочки",
  "сапоги",
  "рабочие",
  "берцы",
  "детские",
  "классика",
  "опт",
  "зимние",
  "46",
  "домашние",
  "армейские"
] as const;

export const DEMO_MINUS_PHRASES = [
  "кроссовки мужские 46",
  "тапочки домашние",
  "сапоги зимние",
  "босоножки детские",
  "рабочие ботинки",
  "туфли мужские классика",
  "берцы армейские"
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isoDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getNowIso() {
  return new Date().toISOString();
}

function sumLast<T>(rows: T[], count: number, selector: (row: T) => number) {
  return rows.slice(Math.max(0, rows.length - count)).reduce((acc, row) => acc + selector(row), 0);
}

function hashText(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU")}₽`;
}

const demoDailySpend = DAILY_SPEND_VALUES.map((spend, index) => ({
  date: isoDateDaysAgo(DAILY_SPEND_VALUES.length - 1 - index),
  spend
}));

const initialCampaigns: DemoCampaign[] = [
  {
    id: 101,
    account_id: 1,
    external_id: "WB-101",
    name: "Кроссовки женские",
    type: "search",
    status: "active",
    daily_budget: 15000,
    auto_minus_enabled: true,
    marketplace: "wb",
    impressions: 245000,
    clicks: 8820,
    ctr: 3.6,
    cpc: 18.5,
    orders: 441,
    cr: 5.0,
    revenue: 1989900,
    drr: 8.2,
    spend: 163170,
    created_at: isoDateDaysAgo(120),
    updated_at: getNowIso()
  },
  {
    id: 102,
    account_id: 1,
    external_id: "WB-102",
    name: "Платья летние",
    type: "catalog",
    status: "active",
    daily_budget: 12000,
    auto_minus_enabled: false,
    marketplace: "wb",
    impressions: 189000,
    clicks: 5670,
    ctr: 3.0,
    cpc: 21.0,
    orders: 198,
    cr: 3.5,
    revenue: 692300,
    drr: 17.2,
    spend: 119070,
    created_at: isoDateDaysAgo(100),
    updated_at: getNowIso()
  },
  {
    id: 103,
    account_id: 2,
    external_id: "OZ-103",
    name: "Джинсы slim fit",
    type: "search",
    status: "active",
    daily_budget: 9000,
    auto_minus_enabled: true,
    marketplace: "ozon",
    impressions: 156000,
    clicks: 1560,
    ctr: 1.0,
    cpc: 45.0,
    orders: 31,
    cr: 2.0,
    revenue: 186200,
    drr: 37.7,
    spend: 70200,
    created_at: isoDateDaysAgo(80),
    updated_at: getNowIso()
  }
];

type QuerySeed = {
  query: string;
  campaign_id: number;
  marketplace: Marketplace;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  label: QueryLabel;
};

const querySeeds: QuerySeed[] = [
  { query: "кроссовки женские", campaign_id: 101, marketplace: "wb", impressions: 64200, clicks: 2480, spend: 44500, orders: 142, label: "relevant" },
  { query: "кроссовки белые женские", campaign_id: 101, marketplace: "wb", impressions: 53200, clicks: 1940, spend: 35600, orders: 101, label: "relevant" },
  { query: "кеды женские", campaign_id: 101, marketplace: "wb", impressions: 38100, clicks: 1410, spend: 26100, orders: 64, label: "relevant" },
  { query: "обувь для бега женская", campaign_id: 101, marketplace: "wb", impressions: 30200, clicks: 970, spend: 17400, orders: 41, label: "relevant" },
  { query: "кроссовки на платформе", campaign_id: 101, marketplace: "wb", impressions: 22100, clicks: 560, spend: 10200, orders: 18, label: "pending" },
  { query: "кроссовки весна", campaign_id: 101, marketplace: "wb", impressions: 17300, clicks: 310, spend: 5900, orders: 7, label: "pending" },
  { query: "кроссовки мужские 46", campaign_id: 101, marketplace: "wb", impressions: 240000, clicks: 1200, spend: 4800, orders: 0, label: "not_relevant" },
  { query: "тапочки домашние", campaign_id: 101, marketplace: "wb", impressions: 142000, clicks: 890, spend: 3200, orders: 0, label: "not_relevant" },
  { query: "сапоги зимние", campaign_id: 101, marketplace: "wb", impressions: 78000, clicks: 450, spend: 2100, orders: 0, label: "not_relevant" },
  { query: "босоножки детские", campaign_id: 101, marketplace: "wb", impressions: 25500, clicks: 110, spend: 600, orders: 0, label: "not_relevant" },
  { query: "рабочие ботинки", campaign_id: 101, marketplace: "wb", impressions: 18200, clicks: 95, spend: 500, orders: 0, label: "not_relevant" },
  { query: "туфли мужские классика", campaign_id: 101, marketplace: "wb", impressions: 22400, clicks: 130, spend: 600, orders: 0, label: "not_relevant" },
  { query: "берцы армейские", campaign_id: 101, marketplace: "wb", impressions: 19300, clicks: 120, spend: 500, orders: 0, label: "not_relevant" },
  { query: "платья летние", campaign_id: 102, marketplace: "wb", impressions: 90100, clicks: 2920, spend: 61200, orders: 98, label: "relevant" },
  { query: "платье в цветок", campaign_id: 102, marketplace: "wb", impressions: 67100, clicks: 1870, spend: 39100, orders: 66, label: "relevant" },
  { query: "платье короткое", campaign_id: 102, marketplace: "wb", impressions: 31800, clicks: 540, spend: 9200, orders: 14, label: "pending" },
  { query: "джинсы slim fit", campaign_id: 103, marketplace: "ozon", impressions: 80400, clicks: 840, spend: 39300, orders: 19, label: "pending" },
  { query: "джинсы мужские slim", campaign_id: 103, marketplace: "ozon", impressions: 75600, clicks: 720, spend: 30900, orders: 12, label: "pending" }
];

function campaignAov(campaignId: number) {
  const campaign = initialCampaigns.find((item) => item.id === campaignId);
  if (!campaign || campaign.orders <= 0) return 0;
  return campaign.revenue / campaign.orders;
}

function buildQueryRows(): DemoQueryRow[] {
  return querySeeds.map((seed, index) => {
    const ctr = seed.impressions > 0 ? (seed.clicks / seed.impressions) * 100 : 0;
    const cpc = seed.clicks > 0 ? seed.spend / seed.clicks : 0;
    const cpo = seed.orders > 0 ? seed.spend / seed.orders : seed.spend;
    const cr = seed.clicks > 0 ? (seed.orders / seed.clicks) * 100 : 0;
    const revenue = campaignAov(seed.campaign_id) * seed.orders;
    const drr = revenue > 0 ? (seed.spend / revenue) * 100 : seed.spend > 0 ? 999 : 0;
    const campaign = initialCampaigns.find((item) => item.id === seed.campaign_id);
    return {
      id: index + 1,
      campaign_id: seed.campaign_id,
      query: seed.query,
      date: isoDateDaysAgo(index % 7),
      impressions: seed.impressions,
      clicks: seed.clicks,
      spend: seed.spend,
      orders: seed.orders,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      cpo: Number(cpo.toFixed(2)),
      cr: Number(cr.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      drr: Number(drr.toFixed(2)),
      relevance_hint: seed.label,
      label: seed.label,
      campaign_name: campaign?.name || "Кампания",
      marketplace: seed.marketplace
    };
  });
}

let campaigns = clone(initialCampaigns);
let queries = buildQueryRows();

let alerts: DemoAlert[] = [
  {
    id: 1,
    type: "ддр",
    message: "🔴 Кампания «Джинсы slim fit»: ДРР 37.7%, требуется оптимизация.",
    is_read: false,
    created_at: isoDateDaysAgo(0),
    campaign_id: 103
  },
  {
    id: 2,
    type: "запросы",
    message: "🔴 Обнаружено 19 нерелевантных запросов — сливают 12,300₽/день.",
    is_read: false,
    created_at: isoDateDaysAgo(0),
    campaign_id: null
  },
  {
    id: 3,
    type: "синхронизация",
    message: "Синхронизация WB и Ozon завершена успешно.",
    is_read: true,
    created_at: isoDateDaysAgo(1),
    campaign_id: null
  }
];

let accounts: DemoAccount[] = [
  {
    id: 1,
    marketplace: "wb",
    name: "WB Демо магазин",
    is_active: true,
    needs_reconnection: false,
    last_synced_at: getNowIso(),
    created_at: isoDateDaysAgo(120)
  },
  {
    id: 2,
    marketplace: "ozon",
    name: "Ozon Демо магазин",
    is_active: true,
    needs_reconnection: false,
    last_synced_at: getNowIso(),
    created_at: isoDateDaysAgo(118)
  }
];

let budgetRules: DemoBudgetRule[] = [
  { id: 1, campaign_id: 103, rule_type: "drr", threshold: 35, action: "pause_campaign", is_active: true },
  { id: 2, campaign_id: 101, rule_type: "daily_budget", threshold: 16000, action: "alert", is_active: true }
];

let watchlist: DemoWatchlistItem[] = [
  { id: 1, account_id: 1, article_id: "WB-112233", keyword: "кроссовки женские", target_position: 12 },
  { id: 2, account_id: 2, article_id: "OZ-778899", keyword: "джинсы slim fit", target_position: 16 }
];

let nextAccountId = 3;
let nextRuleId = 3;
let nextWatchlistId = 3;
const watchlistPositions = new Map<number, DemoWatchlistPosition[]>();

function buildWatchlistPositions(keyword: string, targetPosition = 15): DemoWatchlistPosition[] {
  const seed = hashText(keyword);
  const rows: DemoWatchlistPosition[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const idx = 29 - offset;
    const wave = Math.sin((idx + (seed % 11)) / 4.1) * 2.2;
    const randomShift = ((idx * (seed % 13 + 5)) % 5) - 2;
    const organic = Math.max(1, Math.round(targetPosition + wave + randomShift));
    const paid = Math.max(1, Math.round(organic - 2 + (((idx + seed) % 3) - 1)));
    rows.push({
      date: isoDateDaysAgo(offset),
      organic_position: organic,
      paid_position: paid
    });
  }
  return rows;
}

for (const item of watchlist) {
  watchlistPositions.set(item.id, buildWatchlistPositions(item.keyword, item.target_position ?? 15));
}

function getCampaignOrThrow(campaignId: number) {
  const campaign = campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    throw new Error(`Кампания ${campaignId} не найдена в демо-данных`);
  }
  return campaign;
}

function buildCampaignStats(campaign: DemoCampaign): DemoCampaignStat[] {
  const rows: DemoCampaignStat[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const i = 29 - offset;
    const seasonal = Math.sin((i + campaign.id % 7) / 3.2) * 0.12;
    const jitter = (((i + campaign.id) * 11) % 7 - 3) / 100;
    const factor = Math.max(0.7, 0.95 + seasonal + jitter);
    const spend = Math.max(100, Math.round((campaign.spend / 30) * factor));
    const impressions = Math.max(1000, Math.round((campaign.impressions / 30) * factor));
    const clicks = Math.max(5, Math.round((campaign.clicks / 30) * factor));
    const orders = Math.max(0, Math.round((campaign.orders / 30) * factor));
    const revenue = Math.max(0, Math.round((campaign.revenue / 30) * factor));
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpo = orders > 0 ? spend / orders : spend;
    const cr = clicks > 0 ? (orders / clicks) * 100 : 0;
    const drr = revenue > 0 ? (spend / revenue) * 100 : spend > 0 ? 999 : 0;
    rows.push({
      date: isoDateDaysAgo(offset),
      impressions,
      clicks,
      spend,
      orders,
      revenue,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      cpo: Number(cpo.toFixed(2)),
      drr: Number(drr.toFixed(2)),
      cr: Number(cr.toFixed(2))
    });
  }
  return rows;
}

function compareValue(left: DemoQueryRow, right: DemoQueryRow, key: string) {
  if (key === "date") {
    return left.date.localeCompare(right.date);
  }
  const a = left[key as keyof DemoQueryRow];
  const b = right[key as keyof DemoQueryRow];
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return 0;
}

function buildCleanupResult(campaign: DemoCampaign, applyNow = false): DemoCleanupResult {
  if (campaign.id === 101) {
    return {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      auto_minus_enabled: campaign.auto_minus_enabled,
      irrelevant_found: 15,
      minus_words: [...DEMO_MINUS_WORDS],
      budget_wasted: 58800,
      budget_saved: 8400,
      auto_applied: applyNow || campaign.auto_minus_enabled,
      apply_failed: 0,
      queries: queries
        .filter((item) => item.campaign_id === campaign.id && item.label === "not_relevant")
        .map((item) => ({
          query: item.query,
          impressions: item.impressions,
          clicks: item.clicks,
          ctr: item.ctr,
          cpc: item.cpc,
          orders: item.orders,
          spend: item.spend,
          revenue: item.revenue,
          drr: item.drr,
          rules_triggered: ["правило 1", "правило 4"]
        }))
    };
  }
  if (campaign.id === 102) {
    return {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      auto_minus_enabled: campaign.auto_minus_enabled,
      irrelevant_found: 2,
      minus_words: ["выпускной", "вечерние"],
      budget_wasted: 6300,
      budget_saved: 900,
      auto_applied: applyNow || campaign.auto_minus_enabled,
      apply_failed: 0,
      queries: []
    };
  }
  return {
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    auto_minus_enabled: campaign.auto_minus_enabled,
    irrelevant_found: 2,
    minus_words: ["детские", "теплые"],
    budget_wasted: 21000,
    budget_saved: 3000,
    auto_applied: applyNow || campaign.auto_minus_enabled,
    apply_failed: 0,
    queries: []
  };
}

export function getDemoDailySpend() {
  return clone(demoDailySpend);
}

export function getDemoDashboardSummary(): DemoDashboardSummary {
  const trend = demoDailySpend.map((row, index) => {
    const impressions = Math.round(38000 + Math.sin(index / 4.2) * 5200 + index * 140);
    const clicks = Math.round(impressions * (0.028 + (index % 5) * 0.001));
    const orders = Math.round(clicks * (0.028 + (index % 4) * 0.002));
    return {
      date: row.date,
      impressions,
      clicks,
      orders,
      spend: row.spend
    };
  });
  return {
    spend_today: demoDailySpend[demoDailySpend.length - 1]?.spend ?? 0,
    spend_week: sumLast(demoDailySpend, 7, (row) => row.spend),
    spend_month: 847_320,
    total_orders: 1_247,
    avg_drr: 13.6,
    wb_spend: 623_100,
    ozon_spend: 224_220,
    last_synced_at: getNowIso(),
    totals: {
      impressions: 1_247_000,
      clicks: 38_450,
      ctr: 3.1,
      cpc: 22,
      orders: 1_247,
      cr: 3.2,
      revenue: 6_235_000,
      drr: 13.6,
      spend: 847_320
    },
    trend,
    diagnostics: [
      "❌ 5 кампаний с ДРР > 35%",
      "❌ 12 ключей с 0 продажами сливают 8,400₽/день",
      "❌ CTR ниже 1% в 3 кампаниях — проблема с карточкой"
    ],
    irrelevant_alert: {
      count: 19,
      wasted_per_day: 12300,
      wasted_per_month: 369000
    }
  };
}

export async function listCampaigns(_days = 30) {
  return clone(campaigns);
}

export async function getCampaign(campaignId: number, _days = 30) {
  return clone(getCampaignOrThrow(campaignId));
}

export async function getCampaignStats(campaignId: number, days = 30) {
  const campaign = getCampaignOrThrow(campaignId);
  const stats = buildCampaignStats(campaign);
  return clone(stats.slice(Math.max(0, stats.length - days)));
}

export async function pauseCampaign(campaignId: number) {
  campaigns = campaigns.map((item) =>
    item.id === campaignId ? { ...item, status: "paused", updated_at: getNowIso() } : item
  );
  return { status: "paused" };
}

export async function resumeCampaign(campaignId: number) {
  campaigns = campaigns.map((item) =>
    item.id === campaignId ? { ...item, status: "active", updated_at: getNowIso() } : item
  );
  return { status: "active" };
}

export async function setCampaignAutoMinus(campaignId: number, enabled: boolean) {
  campaigns = campaigns.map((item) =>
    item.id === campaignId ? { ...item, auto_minus_enabled: enabled, updated_at: getNowIso() } : item
  );
  return { campaign_id: campaignId, auto_minus_enabled: enabled };
}

export async function listQueries(params: Record<string, unknown>) {
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const mp = params.marketplace === "wb" || params.marketplace === "ozon" ? params.marketplace : undefined;
  const campaignId = typeof params.campaign_id === "number" ? params.campaign_id : Number(params.campaign_id || 0);
  const ctrMax = typeof params.ctr_max === "number" ? params.ctr_max : Number(params.ctr_max || 0);
  const sortBy = typeof params.sort_by === "string" ? params.sort_by : "date";
  const sortDir = params.sort_dir === "asc" ? "asc" : "desc";
  const limit = typeof params.limit === "number" ? params.limit : Number(params.limit || 0);

  let rows = [...queries];
  if (q) {
    rows = rows.filter((row) => row.query.toLowerCase().includes(q));
  }
  if (mp) {
    rows = rows.filter((row) => row.marketplace === mp);
  }
  if (campaignId) {
    rows = rows.filter((row) => row.campaign_id === campaignId);
  }
  if (ctrMax > 0) {
    rows = rows.filter((row) => row.ctr <= ctrMax);
  }

  rows.sort((left, right) => {
    const comparison = compareValue(left, right, sortBy);
    return sortDir === "asc" ? comparison : -comparison;
  });

  if (limit > 0) {
    rows = rows.slice(0, limit);
  }
  return clone(rows);
}

function isValidLabel(label: string): label is QueryLabel {
  return label === "relevant" || label === "pending" || label === "not_relevant";
}

export async function updateQueryLabelsBulk(campaignId: number, updates: Array<{ query: string; label: string }>) {
  let updatedCount = 0;
  const containsNotRelevant = updates.some((item) => item.label === "not_relevant");

  queries = queries.map((row) => {
    if (row.campaign_id !== campaignId) return row;
    const match = updates.find((item) => item.query === row.query);
    if (!match || !isValidLabel(match.label)) return row;
    updatedCount += 1;
    return { ...row, label: match.label, relevance_hint: match.label };
  });

  return {
    updated_count: updatedCount,
    generated_minus_words: containsNotRelevant ? [...DEMO_MINUS_WORDS] : []
  };
}

export async function generateMinusWords(_campaignId: number, _queries?: string[]) {
  return [...DEMO_MINUS_WORDS];
}

export async function listMinusWords(_campaignId: number) {
  return DEMO_MINUS_WORDS.map((word, index) => ({
    id: index + 1,
    word_root: word,
    source_queries: queries
      .filter((row) => row.query.toLowerCase().includes(word.toLowerCase()))
      .slice(0, 5)
      .map((row) => row.query)
  }));
}

export async function applyMinusWords(_campaignId: number) {
  return {
    applied: 19,
    failed: 0,
    saved_budget_estimate: formatRub(12300)
  };
}

export async function runAutoCleanupCampaign(campaignId: number, params?: { days?: number; apply_now?: boolean }) {
  const campaign = getCampaignOrThrow(campaignId);
  return clone(buildCleanupResult(campaign, Boolean(params?.apply_now)));
}

export async function runAutoCleanupAll(params?: { days?: number; apply_now?: boolean; only_auto_enabled?: boolean }) {
  const results = campaigns.map((campaign) => buildCleanupResult(campaign, Boolean(params?.apply_now)));
  return clone({
    campaigns_processed: 3,
    irrelevant_found: 19,
    budget_wasted: 86100,
    budget_saved: 12300,
    results
  });
}

export async function getQueryTrends(keyword: string, days = 30) {
  const seed = hashText(keyword || "demo");
  const rows: DemoTrendPoint[] = [];
  for (let offset = Math.max(0, days - 1); offset >= 0; offset -= 1) {
    const i = days - 1 - offset;
    const baseline = 3000 + ((seed + i * 77) % 7800);
    const wave = Math.sin((i + (seed % 13)) / 4.2) * 900;
    const impressions = Math.max(400, Math.round(baseline + wave));
    const ctr = 0.8 + ((seed + i * 13) % 24) / 10;
    const clicks = Math.max(4, Math.round((impressions * ctr) / 100));
    const spend = Math.max(150, Math.round(clicks * (3.8 + ((seed + i * 7) % 6) * 0.6)));
    rows.push({
      date: isoDateDaysAgo(offset),
      impressions,
      clicks,
      spend
    });
  }
  return rows;
}

export async function listAlerts(unreadOnly = false) {
  const rows = unreadOnly ? alerts.filter((item) => !item.is_read) : alerts;
  return clone(rows);
}

export async function markAlertsRead(alertIds: number[]) {
  const idSet = new Set(alertIds);
  let updated = 0;
  alerts = alerts.map((item) => {
    if (!idSet.has(item.id) || item.is_read) return item;
    updated += 1;
    return { ...item, is_read: true };
  });
  return { updated };
}

export async function listAccounts() {
  return clone(accounts);
}

export async function connectAccount(payload: {
  marketplace: Marketplace;
  name: string;
  api_token?: string;
  client_id?: string;
  api_key?: string;
}) {
  const account: DemoAccount = {
    id: nextAccountId,
    marketplace: payload.marketplace,
    name: payload.name || `${payload.marketplace.toUpperCase()} аккаунт ${nextAccountId}`,
    is_active: true,
    needs_reconnection: false,
    last_synced_at: getNowIso(),
    created_at: getNowIso()
  };
  nextAccountId += 1;
  accounts = [account, ...accounts];
  return clone(account);
}

export async function refreshAccount(accountId: number) {
  let refreshed = 0;
  accounts = accounts.map((item) => {
    if (item.id !== accountId) return item;
    refreshed += 1;
    return { ...item, last_synced_at: getNowIso(), needs_reconnection: false };
  });
  return { refreshed };
}

export async function listBudgetRules() {
  return clone(budgetRules);
}

export async function createBudgetRule(payload: {
  campaign_id: number;
  rule_type: string;
  threshold: number;
  action: string;
  is_active: boolean;
}) {
  const newRule: DemoBudgetRule = {
    id: nextRuleId,
    campaign_id: payload.campaign_id,
    rule_type: payload.rule_type,
    threshold: payload.threshold,
    action: payload.action,
    is_active: payload.is_active
  };
  nextRuleId += 1;
  budgetRules = [newRule, ...budgetRules];
  return clone(newRule);
}

export async function toggleBudgetRule(ruleId: number) {
  let updated: DemoBudgetRule | null = null;
  budgetRules = budgetRules.map((rule) => {
    if (rule.id !== ruleId) return rule;
    updated = { ...rule, is_active: !rule.is_active };
    return updated;
  });
  if (!updated) {
    throw new Error(`Правило ${ruleId} не найдено в демо-данных`);
  }
  return clone(updated);
}

export async function runBudgetChecks() {
  return { triggered: budgetRules.filter((item) => item.is_active).length };
}

export async function listWatchlist() {
  return clone(watchlist);
}

export async function createWatchlist(payload: {
  account_id: number;
  article_id: string;
  keyword: string;
  target_position?: number | null;
}) {
  const row: DemoWatchlistItem = {
    id: nextWatchlistId,
    account_id: payload.account_id,
    article_id: payload.article_id,
    keyword: payload.keyword,
    target_position: payload.target_position ?? null
  };
  nextWatchlistId += 1;
  watchlist = [row, ...watchlist];
  watchlistPositions.set(row.id, buildWatchlistPositions(row.keyword, row.target_position ?? 15));
  return clone(row);
}

export async function deleteWatchlist(id: number) {
  watchlist = watchlist.filter((item) => item.id !== id);
  watchlistPositions.delete(id);
  return { deleted: 1 };
}

export async function getKeywordPositions(watchlistId: number, days = 30) {
  const positions = watchlistPositions.get(watchlistId) || [];
  return clone(positions.slice(Math.max(0, positions.length - days)));
}
