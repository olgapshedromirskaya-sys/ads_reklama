import { apiClient } from "./client";
import { isDemoMode } from "@/demo/mode";
import * as demoApi from "@/demo/mockApi";

export type UserRole = "owner" | "admin" | "manager";

export type TelegramUser = {
  id: number;
  telegram_id: number;
  username?: string | null;
  name: string;
  role: UserRole;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: TelegramUser;
};

export type Campaign = {
  id: number;
  account_id: number;
  external_id: string;
  name: string;
  type?: string | null;
  status?: string | null;
  daily_budget?: number | null;
  auto_minus_enabled: boolean;
  marketplace?: "wb" | "ozon" | null;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  orders: number;
  cr: number;
  cart_adds?: number | null;
  revenue: number;
  drr: number;
  spend: number;
  created_at: string;
  updated_at: string;
};

export type CampaignStat = {
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

export type DashboardSummary = {
  spend_today: number;
  spend_week: number;
  spend_month: number;
  total_orders: number;
  avg_drr: number;
  wb_spend: number;
  ozon_spend: number;
  last_synced_at?: string | null;
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

export type DashboardSummaryParams = {
  marketplace?: "wb" | "ozon";
  period?: "day" | "month" | "custom";
  date_from?: string;
  date_to?: string;
};

export type QueryRow = {
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
  relevance_hint?: "relevant" | "not_relevant" | "pending";
  label?: "relevant" | "not_relevant" | "pending";
  campaign_name?: string;
  marketplace?: "wb" | "ozon";
};

export type AutoCleanupQuery = {
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

export type AutoCleanupResult = {
  campaign_id: number;
  campaign_name: string;
  auto_minus_enabled: boolean;
  irrelevant_found: number;
  minus_words: string[];
  budget_wasted: number;
  budget_saved: number;
  auto_applied: boolean;
  apply_failed: number;
  queries: AutoCleanupQuery[];
};

export type AutoCleanupAllResult = {
  campaigns_processed: number;
  irrelevant_found: number;
  budget_wasted: number;
  budget_saved: number;
  results: AutoCleanupResult[];
};

export type AlertRow = {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  campaign_id?: number | null;
};

export type Account = {
  id: number;
  marketplace: "wb" | "ozon";
  name: string;
  is_active: boolean;
  needs_reconnection: boolean;
  last_synced_at?: string | null;
  created_at: string;
};

export type TeamMember = {
  telegram_id: number;
  username?: string | null;
  full_name: string;
  role: UserRole;
  added_by?: number | null;
  added_at?: string;
  is_active?: boolean;
};

export type Employee = {
  telegram_id: number;
  username?: string | null;
  full_name: string;
  role: UserRole;
  added_by?: number | null;
  added_at: string;
  is_active: boolean;
};

export type BudgetRule = {
  id: number;
  campaign_id: number;
  rule_type: string;
  threshold: number;
  action: string;
  is_active: boolean;
};

export type WatchlistItem = {
  id: number;
  account_id: number;
  article_id: string;
  keyword: string;
  target_position?: number | null;
};

export type WatchlistPosition = {
  date: string;
  organic_position?: number | null;
  paid_position?: number | null;
};

export type QueryTrendPoint = {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
};

export type MinusWordsApplyResult = {
  applied: number;
  failed: number;
  saved_budget_estimate: string;
};

export async function telegramLogin(initData: string): Promise<AuthResponse> {
  const { data: response } = await apiClient.post<AuthResponse>("/auth/telegram", { init_data: initData });
  if (!response?.user?.id) {
    throw new Error("Invalid auth response");
  }
  return response;
}

export async function getDashboardSummary(params?: DashboardSummaryParams) {
  if (isDemoMode()) {
    return demoApi.getDemoDashboardSummary(params);
  }
  const { data } = await apiClient.get<DashboardSummary>("/campaigns/dashboard/summary", { params });
  return data;
}

export async function listCampaigns(days = 30) {
  if (isDemoMode()) {
    return demoApi.listCampaigns(days);
  }
  const { data } = await apiClient.get<Campaign[]>("/campaigns", { params: { days } });
  return data;
}

export async function getCampaign(campaignId: number, days = 30) {
  if (isDemoMode()) {
    return demoApi.getCampaign(campaignId, days);
  }
  const { data } = await apiClient.get<Campaign>(`/campaigns/${campaignId}`, { params: { days } });
  return data;
}

export async function getCampaignStats(campaignId: number, days = 30) {
  if (isDemoMode()) {
    return demoApi.getCampaignStats(campaignId, days);
  }
  const { data } = await apiClient.get<CampaignStat[]>(`/campaigns/${campaignId}/stats`, { params: { days } });
  return data;
}

export async function pauseCampaign(campaignId: number) {
  if (isDemoMode()) {
    return demoApi.pauseCampaign(campaignId);
  }
  const { data } = await apiClient.post(`/campaigns/${campaignId}/pause`);
  return data;
}

export async function resumeCampaign(campaignId: number) {
  if (isDemoMode()) {
    return demoApi.resumeCampaign(campaignId);
  }
  const { data } = await apiClient.post(`/campaigns/${campaignId}/resume`);
  return data;
}

export async function setCampaignAutoMinus(campaignId: number, enabled: boolean) {
  if (isDemoMode()) {
    return demoApi.setCampaignAutoMinus(campaignId, enabled);
  }
  const { data } = await apiClient.post<{ campaign_id: number; auto_minus_enabled: boolean }>(
    `/campaigns/${campaignId}/auto-minus`,
    { enabled }
  );
  return data;
}

export async function listQueries(params: Record<string, unknown>) {
  if (isDemoMode()) {
    return demoApi.listQueries(params);
  }
  const { data } = await apiClient.get<QueryRow[]>("/queries", { params });
  return data;
}

export async function updateQueryLabelsBulk(campaignId: number, updates: Array<{ query: string; label: string }>) {
  if (isDemoMode()) {
    return demoApi.updateQueryLabelsBulk(campaignId, updates);
  }
  const { data } = await apiClient.post<{ updated_count: number; generated_minus_words: string[] }>("/queries/labels/bulk", {
    campaign_id: campaignId,
    updates
  });
  return data;
}

export async function generateMinusWords(campaignId: number, queries?: string[]) {
  if (isDemoMode()) {
    return demoApi.generateMinusWords(campaignId, queries);
  }
  const { data } = await apiClient.post<string[]>("/queries/minus-words/generate", {
    campaign_id: campaignId,
    queries
  });
  return data;
}

export async function listMinusWords(campaignId: number) {
  if (isDemoMode()) {
    return demoApi.listMinusWords(campaignId);
  }
  const { data } = await apiClient.get<Array<{ id: number; word_root: string; source_queries: string[] }>>(
    `/queries/minus-words/${campaignId}`
  );
  return data;
}

export async function applyMinusWords(campaignId: number) {
  if (isDemoMode()) {
    return demoApi.applyMinusWords(campaignId);
  }
  const { data } = await apiClient.post<MinusWordsApplyResult>(`/queries/minus-words/${campaignId}/apply`);
  return data;
}

export async function runAutoCleanupCampaign(campaignId: number, params?: { days?: number; apply_now?: boolean }) {
  if (isDemoMode()) {
    return demoApi.runAutoCleanupCampaign(campaignId, params);
  }
  const { data } = await apiClient.post<AutoCleanupResult>(`/queries/auto-cleanup/${campaignId}`, undefined, {
    params
  });
  return data;
}

export async function runAutoCleanupAll(params?: { days?: number; apply_now?: boolean; only_auto_enabled?: boolean }) {
  if (isDemoMode()) {
    return demoApi.runAutoCleanupAll(params);
  }
  const { data } = await apiClient.post<AutoCleanupAllResult>("/queries/auto-cleanup/all", undefined, { params });
  return data;
}

export function queriesExportUrl(campaignId?: number) {
  const query = campaignId ? `?campaign_id=${campaignId}` : "";
  return `${apiClient.defaults.baseURL}/queries/export.xlsx${query}`;
}

export async function listAlerts(unreadOnly = false) {
  if (isDemoMode()) {
    return demoApi.listAlerts(unreadOnly);
  }
  const { data } = await apiClient.get<AlertRow[]>("/alerts", { params: { unread_only: unreadOnly } });
  return data;
}

export async function markAlertsRead(alertIds: number[]) {
  if (isDemoMode()) {
    return demoApi.markAlertsRead(alertIds);
  }
  const { data } = await apiClient.post<{ updated: number }>("/alerts/read", { alert_ids: alertIds });
  return data;
}

export async function listAccounts() {
  if (isDemoMode()) {
    return demoApi.listAccounts();
  }
  const { data } = await apiClient.get<Account[]>("/auth/accounts");
  return data;
}

export async function listEmployees() {
  if (isDemoMode()) {
    return demoApi.listEmployees();
  }
  const { data } = await apiClient.get<Employee[]>("/users/list");
  return data;
}

export async function addEmployee(payload: {
  telegram_id: number;
  username?: string | null;
  full_name?: string | null;
  role: Exclude<UserRole, "owner">;
}) {
  if (isDemoMode()) {
    return demoApi.addEmployee(payload);
  }
  const { data } = await apiClient.post<Employee>("/users/add-employee", payload);
  return data;
}

export async function removeEmployee(telegramId: number) {
  if (isDemoMode()) {
    return demoApi.removeEmployee(telegramId);
  }
  const { data } = await apiClient.delete<{ removed: number }>(`/users/${telegramId}`);
  return data;
}

export async function listTeamMembers() {
  return listEmployees();
}

export async function addTeamMember(payload: {
  telegram_id: number;
  username?: string | null;
  full_name?: string | null;
  role: Exclude<UserRole, "owner">;
}) {
  return addEmployee(payload);
}

export async function removeTeamMember(telegramId: number) {
  return removeEmployee(telegramId);
}

export async function connectAccount(payload: {
  marketplace: "wb" | "ozon";
  name: string;
  api_token?: string;
  client_id?: string;
  api_key?: string;
}) {
  if (isDemoMode()) {
    return demoApi.connectAccount(payload);
  }
  const { data } = await apiClient.post<Account>("/auth/accounts", payload);
  return data;
}

export async function refreshAccount(accountId: number) {
  if (isDemoMode()) {
    return demoApi.refreshAccount(accountId);
  }
  const { data } = await apiClient.post<Record<string, number>>(`/auth/accounts/${accountId}/refresh`);
  return data;
}

export async function listBudgetRules() {
  if (isDemoMode()) {
    return demoApi.listBudgetRules();
  }
  const { data } = await apiClient.get<BudgetRule[]>("/budget/rules");
  return data;
}

export async function createBudgetRule(payload: {
  campaign_id: number;
  rule_type: string;
  threshold: number;
  action: string;
  is_active: boolean;
}) {
  if (isDemoMode()) {
    return demoApi.createBudgetRule(payload);
  }
  const { data } = await apiClient.post("/budget/rules", payload);
  return data;
}

export async function toggleBudgetRule(ruleId: number) {
  if (isDemoMode()) {
    return demoApi.toggleBudgetRule(ruleId);
  }
  const { data } = await apiClient.post(`/budget/rules/${ruleId}/toggle`);
  return data;
}

export async function listWatchlist() {
  if (isDemoMode()) {
    return demoApi.listWatchlist();
  }
  const { data } = await apiClient.get<WatchlistItem[]>("/keywords/watchlist");
  return data;
}

export async function createWatchlist(payload: {
  account_id: number;
  article_id: string;
  keyword: string;
  target_position?: number | null;
}) {
  if (isDemoMode()) {
    return demoApi.createWatchlist(payload);
  }
  const { data } = await apiClient.post("/keywords/watchlist", payload);
  return data;
}

export async function deleteWatchlist(id: number) {
  if (isDemoMode()) {
    return demoApi.deleteWatchlist(id);
  }
  const { data } = await apiClient.delete(`/keywords/watchlist/${id}`);
  return data;
}

export async function getKeywordPositions(watchlistId: number, days = 30) {
  if (isDemoMode()) {
    return demoApi.getKeywordPositions(watchlistId, days);
  }
  const { data } = await apiClient.get<WatchlistPosition[]>(`/keywords/${watchlistId}/positions`, { params: { days } });
  return data;
}

export async function runBudgetChecks() {
  if (isDemoMode()) {
    return demoApi.runBudgetChecks();
  }
  const { data } = await apiClient.post<{ triggered: number }>("/budget/check");
  return data;
}

export async function getQueryTrends(keyword: string, days = 30) {
  if (isDemoMode()) {
    return demoApi.getQueryTrends(keyword, days);
  }
  const { data } = await apiClient.get<QueryTrendPoint[]>("/queries/trends", { params: { query: keyword, days } });
  return data;
}
