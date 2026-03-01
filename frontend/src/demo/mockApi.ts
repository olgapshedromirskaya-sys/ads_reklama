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
  avg_drr: number;
  marketplace: Marketplace;
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
  relevance_hint: QueryLabel;
  label: QueryLabel;
  campaign_name: string;
  marketplace: Marketplace;
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

export const DEMO_MINUS_WORDS = ["мужские", "детские", "зимние", "б/у", "ремонт", "wholesale"] as const;
export const DEMO_MINUS_PHRASES = [
  "кроссовки мужские 46",
  "кроссовки детские светящиеся",
  "кеды зимние",
  "кроссовки б/у",
  "ремонт кроссовок",
  "wholesale sneakers lot"
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

const demoDailySpend = DAILY_SPEND_VALUES.map((spend, index) => ({
  date: isoDateDaysAgo(DAILY_SPEND_VALUES.length - 1 - index),
  spend
}));

function sumLast<T>(rows: T[], count: number, selector: (row: T) => number) {
  return rows.slice(Math.max(0, rows.length - count)).reduce((acc, row) => acc + selector(row), 0);
}

export function getDemoDailySpend() {
  return clone(demoDailySpend);
}

export function getDemoDashboardSummary(): DemoDashboardSummary {
  return {
    spend_today: demoDailySpend[demoDailySpend.length - 1]?.spend ?? 0,
    spend_week: sumLast(demoDailySpend, 7, (row) => row.spend),
    spend_month: 847_320,
    total_orders: 1_247,
    avg_drr: 12.3,
    wb_spend: 623_100,
    ozon_spend: 224_220,
    last_synced_at: getNowIso()
  };
}

const initialCampaigns: DemoCampaign[] = [
  {
    id: 101,
    account_id: 1,
    external_id: "WB-101",
    name: "Кроссовки женские",
    type: "search",
    status: "active",
    daily_budget: 15000,
    avg_drr: 11.2,
    marketplace: "wb",
    created_at: isoDateDaysAgo(90),
    updated_at: getNowIso()
  },
  {
    id: 102,
    account_id: 1,
    external_id: "WB-102",
    name: "Платья летние",
    type: "catalog",
    status: "active",
    daily_budget: 8000,
    avg_drr: 14.5,
    marketplace: "wb",
    created_at: isoDateDaysAgo(72),
    updated_at: getNowIso()
  },
  {
    id: 103,
    account_id: 2,
    external_id: "OZ-103",
    name: "Кроссовки мужские",
    type: "search",
    status: "active",
    daily_budget: 12000,
    avg_drr: 9.8,
    marketplace: "ozon",
    created_at: isoDateDaysAgo(64),
    updated_at: getNowIso()
  },
  {
    id: 104,
    account_id: 1,
    external_id: "WB-104",
    name: "Джинсы slim fit",
    type: "search",
    status: "paused",
    daily_budget: 5000,
    avg_drr: 18.1,
    marketplace: "wb",
    created_at: isoDateDaysAgo(51),
    updated_at: getNowIso()
  },
  {
    id: 105,
    account_id: 2,
    external_id: "OZ-105",
    name: "Футболки базовые",
    type: "catalog",
    status: "active",
    daily_budget: 6500,
    avg_drr: 13.7,
    marketplace: "ozon",
    created_at: isoDateDaysAgo(43),
    updated_at: getNowIso()
  }
];

type QuerySeed = {
  query: string;
  label: QueryLabel;
  campaignId: number;
  marketplace: Marketplace;
  impressions: number;
  ctr: number;
  spend: number;
  orders: number;
};

const querySeeds: QuerySeed[] = [
  { query: "кроссовки женские", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 48200, ctr: 4.8, spend: 6500, orders: 58 },
  { query: "кроссовки белые женские", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 40300, ctr: 4.2, spend: 5800, orders: 51 },
  { query: "кеды женские комфорт", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 36600, ctr: 3.9, spend: 5400, orders: 47 },
  { query: "обувь для бега женская", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 38800, ctr: 4.1, spend: 6200, orders: 54 },
  { query: "кроссовки летние легкие", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 35200, ctr: 3.8, spend: 5600, orders: 45 },
  { query: "кроссовки сетка", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 33400, ctr: 3.7, spend: 5200, orders: 43 },
  { query: "кроссовки повседневные", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 31800, ctr: 3.6, spend: 4900, orders: 40 },
  { query: "кроссовки на платформе", label: "relevant", campaignId: 101, marketplace: "wb", impressions: 34100, ctr: 3.9, spend: 5400, orders: 44 },
  { query: "обувь спортивная", label: "pending", campaignId: 101, marketplace: "wb", impressions: 22600, ctr: 1.3, spend: 2200, orders: 11 },
  { query: "sneakers women", label: "pending", campaignId: 101, marketplace: "wb", impressions: 17100, ctr: 1.2, spend: 1800, orders: 8 },
  { query: "кеды casual", label: "pending", campaignId: 101, marketplace: "wb", impressions: 14900, ctr: 1.1, spend: 1600, orders: 7 },
  { query: "кроссовки скидка", label: "pending", campaignId: 101, marketplace: "wb", impressions: 16400, ctr: 1.2, spend: 2100, orders: 9 },
  { query: "обувь демисезон", label: "pending", campaignId: 101, marketplace: "wb", impressions: 15300, ctr: 1.0, spend: 1900, orders: 6 },
  { query: "кроссовки мужские 46", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 9200, ctr: 0.2, spend: 2300, orders: 0 },
  { query: "кроссовки детские светящиеся", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 8700, ctr: 0.2, spend: 1800, orders: 0 },
  { query: "ботинки зимние мужские", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 8100, ctr: 0.2, spend: 1600, orders: 0 },
  { query: "кроссовки б/у оригинал", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 6900, ctr: 0.2, spend: 1400, orders: 0 },
  { query: "ремонт кроссовок", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 7400, ctr: 0.1, spend: 1700, orders: 0 },
  { query: "wholesale sneakers lot", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 6700, ctr: 0.2, spend: 1500, orders: 0 },
  { query: "зимние кеды детские", label: "not_relevant", campaignId: 101, marketplace: "wb", impressions: 7100, ctr: 0.2, spend: 2000, orders: 0 }
];

function buildQueryRows(): DemoQueryRow[] {
  return querySeeds.map((seed, index) => {
    const clicks = Math.max(1, Math.round((seed.impressions * seed.ctr) / 100));
    const cpc = Number((seed.spend / clicks).toFixed(2));
    const cpo = Number((seed.orders > 0 ? seed.spend / seed.orders : seed.spend).toFixed(2));
    const campaignName = initialCampaigns.find((campaign) => campaign.id === seed.campaignId)?.name ?? "Campaign";
    return {
      id: index + 1,
      campaign_id: seed.campaignId,
      query: seed.query,
      date: isoDateDaysAgo(index % 14),
      impressions: seed.impressions,
      clicks,
      spend: seed.spend,
      orders: seed.orders,
      ctr: seed.ctr,
      cpc,
      cpo,
      relevance_hint: seed.label,
      label: seed.label,
      campaign_name: campaignName,
      marketplace: seed.marketplace
    };
  });
}

let campaigns = clone(initialCampaigns);
let queries = buildQueryRows();

let alerts: DemoAlert[] = [
  {
    id: 1,
    type: "budget",
    message: "Campaign «Джинсы slim fit» paused due to DRR > 18%",
    is_read: false,
    created_at: isoDateDaysAgo(0),
    campaign_id: 104
  },
  {
    id: 2,
    type: "query",
    message: "12 low-CTR queries detected in «Кроссовки женские»",
    is_read: false,
    created_at: isoDateDaysAgo(1),
    campaign_id: 101
  },
  {
    id: 3,
    type: "sync",
    message: "WB and Ozon accounts synced successfully.",
    is_read: true,
    created_at: isoDateDaysAgo(2),
    campaign_id: null
  }
];

let accounts: DemoAccount[] = [
  {
    id: 1,
    marketplace: "wb",
    name: "WB Demo Store",
    is_active: true,
    needs_reconnection: false,
    last_synced_at: getNowIso(),
    created_at: isoDateDaysAgo(80)
  },
  {
    id: 2,
    marketplace: "ozon",
    name: "Ozon Demo Store",
    is_active: true,
    needs_reconnection: false,
    last_synced_at: getNowIso(),
    created_at: isoDateDaysAgo(78)
  }
];

let budgetRules: DemoBudgetRule[] = [
  { id: 1, campaign_id: 101, rule_type: "drr", threshold: 16, action: "alert", is_active: true },
  { id: 2, campaign_id: 104, rule_type: "daily_budget", threshold: 5000, action: "pause_campaign", is_active: true },
  { id: 3, campaign_id: 105, rule_type: "ctr_drop", threshold: 1.1, action: "alert", is_active: false }
];

let watchlist: DemoWatchlistItem[] = [
  { id: 1, account_id: 1, article_id: "WB-532992", keyword: "кроссовки женские", target_position: 12 },
  { id: 2, account_id: 2, article_id: "OZ-88412", keyword: "футболки базовые", target_position: 18 }
];

let nextAccountId = 3;
let nextRuleId = 4;
let nextWatchlistId = 3;

const watchlistPositions = new Map<number, DemoWatchlistPosition[]>();

function hashText(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildWatchlistPositions(keyword: string, targetPosition = 15): DemoWatchlistPosition[] {
  const seed = hashText(keyword);
  const rows: DemoWatchlistPosition[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const idx = 29 - offset;
    const seasonal = Math.sin((idx + (seed % 9)) / 3.8) * 2.5;
    const randomShift = ((idx * (seed % 17 + 3)) % 6) - 3;
    const organic = Math.max(1, Math.round(targetPosition + seasonal + randomShift));
    const paid = Math.max(1, Math.round(organic - 2 + (((idx + seed) % 4) - 1)));
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
    throw new Error(`Campaign ${campaignId} not found in demo dataset`);
  }
  return campaign;
}

export async function listCampaigns() {
  return clone(campaigns);
}

export async function getCampaign(campaignId: number) {
  return clone(getCampaignOrThrow(campaignId));
}

function buildCampaignStats(campaign: DemoCampaign): DemoCampaignStat[] {
  const rows: DemoCampaignStat[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const i = 29 - offset;
    const seasonal = Math.sin((i + campaign.id % 5) / 3.2) * 0.13;
    const jitter = (((i + campaign.id) * 17) % 9 - 4) / 100;
    const factor = Math.max(0.65, 0.95 + seasonal + jitter);
    const spend = Math.round(campaign.daily_budget * factor);
    const impressions = Math.max(1000, Math.round(spend * (28 + ((i * 3 + campaign.id) % 12))));
    const ctr = Number((1.6 + ((i * 5 + campaign.id) % 28) / 10).toFixed(2));
    const clicks = Math.max(10, Math.round((impressions * ctr) / 100));
    const cr = 1.2 + ((i * 7 + campaign.id) % 11) / 10;
    const orders = Math.max(1, Math.round((clicks * cr) / 100));
    const drr = Number((campaign.avg_drr + (((i + campaign.id) % 7) - 3) * 0.4).toFixed(2));
    const revenue = Math.max(spend + 1500, Math.round((spend * 100) / Math.max(6, drr)));
    rows.push({
      date: isoDateDaysAgo(offset),
      impressions,
      clicks,
      spend,
      orders,
      revenue,
      ctr: Number(((clicks / impressions) * 100).toFixed(2)),
      cpc: Number((spend / clicks).toFixed(2)),
      cpo: Number((spend / orders).toFixed(2)),
      drr: Number(((spend / revenue) * 100).toFixed(2))
    });
  }
  return rows;
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
  return { ok: true };
}

export async function resumeCampaign(campaignId: number) {
  campaigns = campaigns.map((item) =>
    item.id === campaignId ? { ...item, status: "active", updated_at: getNowIso() } : item
  );
  return { ok: true };
}

function compareValue(left: DemoQueryRow, right: DemoQueryRow, key: string) {
  if (key === "date") {
    return left.date.localeCompare(right.date);
  }
  const a = left[key as keyof DemoQueryRow];
  const b = right[key as keyof DemoQueryRow];
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b);
  }
  return 0;
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
    if (row.campaign_id !== campaignId) {
      return row;
    }
    const match = updates.find((item) => item.query === row.query);
    if (!match || !isValidLabel(match.label)) {
      return row;
    }
    updatedCount += 1;
    return {
      ...row,
      label: match.label,
      relevance_hint: match.label
    };
  });

  return {
    updated_count: updatedCount,
    generated_minus_words: containsNotRelevant ? [...DEMO_MINUS_WORDS] : []
  };
}

export async function generateMinusWords(_campaignId: number, _queries?: string[]) {
  return [...DEMO_MINUS_WORDS];
}

export async function applyMinusWords(_campaignId: number) {
  return {
    applied: DEMO_MINUS_WORDS.length,
    failed: 0,
    saved_budget_estimate: "12,300₽"
  };
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

export async function getQueryTrends(keyword: string, days = 30) {
  const seed = hashText(keyword || "demo");
  const rows: DemoTrendPoint[] = [];
  for (let offset = Math.max(0, days - 1); offset >= 0; offset -= 1) {
    const i = days - 1 - offset;
    const baseline = 3200 + ((seed + i * 79) % 8500);
    const wave = Math.sin((i + (seed % 13)) / 4.4) * 1100;
    const impressions = Math.max(500, Math.round(baseline + wave));
    const ctr = 0.9 + ((seed + i * 17) % 31) / 10;
    const clicks = Math.max(4, Math.round((impressions * ctr) / 100));
    const spend = Math.max(200, Math.min(8000, Math.round(clicks * (3.4 + ((seed + i * 5) % 7) * 0.5))));
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
    if (!idSet.has(item.id) || item.is_read) {
      return item;
    }
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
    name: payload.name || `${payload.marketplace.toUpperCase()} account ${nextAccountId}`,
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
    if (item.id !== accountId) {
      return item;
    }
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
    if (rule.id !== ruleId) {
      return rule;
    }
    updated = { ...rule, is_active: !rule.is_active };
    return updated;
  });
  if (!updated) {
    throw new Error(`Rule ${ruleId} not found in demo dataset`);
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
