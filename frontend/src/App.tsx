import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  connectAccount,
  getDashboardSummary,
  listAccounts,
  listCampaigns,
  telegramLogin,
  type Account,
  type Campaign
} from "@/api/endpoints";
import { canManageApiKeys, resolveUserRole } from "@/auth/roles";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { resolveLaunchContext, setDemoMode } from "@/demo/mode";

const T = {
  bg: "#151c2e",
  card: "#1e2640",
  card2: "#252e4a",
  border: "rgba(255,255,255,0.07)",
  text: "#ffffff",
  sub: "#8892a4",
  green: "#4ade80",
  yellow: "#fbbf24",
  red: "#f87171",
  wb: "#7c3aed",
  ozon: "#2563eb"
};

type Platform = "wb" | "ozon";
type MainTab = "dashboard" | "bids" | "settings";
type DashboardTab = "overview" | "planfact";

type PlanFactState = {
  drrTarget: number | null;
  budget: number | null;
};

function fmtRub(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
}

function fmtInt(value: number) {
  return Math.round(value).toLocaleString("ru-RU");
}

function StatusBadge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        color,
        background: `${color}20`,
        border: `1px solid ${color}50`,
        borderRadius: 10,
        padding: "2px 8px"
      }}
    >
      {text}
    </span>
  );
}

function App() {
  useTelegramTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const role = resolveUserRole(user);
  const isOwner = role === "owner";
  const canApiManage = canManageApiKeys(user);
  const canEditPlanFact = role !== "manager";

  const [bootstrapping, setBootstrapping] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authDemoMode, setAuthDemoMode] = useState(false);

  const [platform, setPlatform] = useState<Platform>("wb");
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");

  const [planFact, setPlanFact] = useState<Record<Platform, PlanFactState>>({
    wb: { drrTarget: null, budget: null },
    ozon: { drrTarget: null, budget: null }
  });

  useEffect(() => {
    let mounted = true;

    function enableDemo() {
      if (!mounted) return;
      setAuthDemoMode(true);
      setDemoMode(true);
      setAccessDenied(false);
    }

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      if (mounted) {
        setAuthDemoMode(launchContext.demoMode);
      }
      setDemoMode(launchContext.demoMode);

      if (launchContext.demoMode) {
        if (mounted) {
          setBootstrapping(false);
          setAccessDenied(false);
        }
        return;
      }

      const initData = launchContext.initData;
      if (!initData) {
        enableDemo();
        if (mounted) {
          setBootstrapping(false);
        }
        return;
      }

      clearAuth();
      try {
        const auth = await telegramLogin(initData);
        if (!auth?.user?.id) {
          throw new Error("Invalid auth response");
        }
        if (!mounted) return;
        localStorage.setItem("mp-ads-jwt", auth.access_token);
        setAuth(auth.access_token, auth.user);
        setAuthDemoMode(false);
        setDemoMode(false);
        setAccessDenied(false);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          if (mounted) {
            setAccessDenied(true);
            setAuthDemoMode(false);
          }
          setDemoMode(false);
        } else {
          enableDemo();
        }
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, [setAuth, clearAuth]);

  const accountsQuery = useQuery({
    queryKey: ["runtime-accounts"],
    queryFn: listAccounts,
    enabled: !bootstrapping && !accessDenied && !authDemoMode,
    retry: false
  });

  const activeAccounts = useMemo(
    () => (accountsQuery.data || []).filter((item) => item.is_active && !item.needs_reconnection),
    [accountsQuery.data]
  );
  const hasWb = activeAccounts.some((item) => item.marketplace === "wb");
  const hasOzon = activeAccounts.some((item) => item.marketplace === "ozon");
  const runtimeDemoMode = authDemoMode || (!hasWb && !hasOzon);
  const availablePlatforms: Platform[] = runtimeDemoMode
    ? ["wb", "ozon"]
    : hasWb && hasOzon
    ? ["wb", "ozon"]
    : hasWb
    ? ["wb"]
    : ["ozon"];

  useEffect(() => {
    setDemoMode(runtimeDemoMode);
  }, [runtimeDemoMode]);

  useEffect(() => {
    if (!availablePlatforms.includes(platform)) {
      setPlatform(availablePlatforms[0]);
    }
  }, [availablePlatforms, platform]);

  const summaryQuery = useQuery({
    queryKey: ["summary", platform, runtimeDemoMode],
    queryFn: () =>
      getDashboardSummary({
        marketplace: runtimeDemoMode ? undefined : platform,
        period: "month"
      }),
    enabled: !bootstrapping && !accessDenied
  });

  const campaignsQuery = useQuery({
    queryKey: ["campaigns", runtimeDemoMode],
    queryFn: () => listCampaigns(30),
    enabled: !bootstrapping && !accessDenied
  });

  const connectMutation = useMutation({
    mutationFn: connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runtime-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    }
  });

  if (bootstrapping) {
    return <LoadingScreen text="Авторизация..." fullscreen />;
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, maxWidth: 420 }}>
          <div style={{ fontSize: 24, color: T.text, fontWeight: 700, marginBottom: 8 }}>🔒 Доступ закрыт</div>
          <div style={{ color: T.sub, fontSize: 13 }}>
            Доступ открыт только приглашённым пользователям. Добавление/удаление сотрудников выполняется владельцем через Telegram-бот.
          </div>
        </div>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const allCampaigns = campaignsQuery.data || [];
  const campaigns = allCampaigns.filter((item) => item.marketplace === platform);
  const target = planFact[platform].drrTarget;
  const budget = planFact[platform].budget;
  const budgetPct = budget && summary ? Math.round((summary.spend_month / budget) * 100) : null;
  const drrDiff = target != null && summary ? summary.avg_drr - target : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif", paddingBottom: 80 }}>
      {runtimeDemoMode && (
        <div style={{ position: "fixed", right: 12, top: 10, zIndex: 100, fontSize: 10, fontWeight: 700, color: "#000", background: T.yellow, borderRadius: 999, padding: "3px 10px" }}>
          ДЕМО РЕЖИМ
        </div>
      )}

      <div style={{ position: "sticky", top: 0, zIndex: 40, background: T.card, borderBottom: `1px solid ${T.border}`, padding: "10px 14px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {availablePlatforms.includes("wb") && (
                <button
                  onClick={() => setPlatform("wb")}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: "6px 10px",
                    color: "#fff",
                    background: platform === "wb" ? T.wb : "rgba(255,255,255,0.08)"
                  }}
                >
                  🟣 WB
                </button>
              )}
              {availablePlatforms.includes("ozon") && (
                <button
                  onClick={() => setPlatform("ozon")}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: "6px 10px",
                    color: "#fff",
                    background: platform === "ozon" ? T.ozon : "rgba(255,255,255,0.08)"
                  }}
                >
                  🔵 Ozon
                </button>
              )}
            </div>
            <StatusBadge text={role === "owner" ? "Руководитель" : role === "admin" ? "Администратор" : "Менеджер"} color={role === "manager" ? T.yellow : T.green} />
          </div>

          {mainTab === "dashboard" && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setDashboardTab("overview")}
                style={{
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 10px",
                  cursor: "pointer",
                  color: dashboardTab === "overview" ? "#fff" : T.sub,
                  background: dashboardTab === "overview" ? (platform === "wb" ? T.wb : T.ozon) : "rgba(255,255,255,0.06)"
                }}
              >
                Обзор
              </button>
              {canEditPlanFact && (
                <button
                  onClick={() => setDashboardTab("planfact")}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    padding: "4px 10px",
                    cursor: "pointer",
                    color: dashboardTab === "planfact" ? "#fff" : T.sub,
                    background: dashboardTab === "planfact" ? (platform === "wb" ? T.wb : T.ozon) : "rgba(255,255,255,0.06)"
                  }}
                >
                  План/Факт
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {summaryQuery.isLoading && <LoadingScreen text="Загрузка показателей..." />}

        {!summaryQuery.isLoading && mainTab === "dashboard" && dashboardTab === "overview" && summary && (
          <>
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📊 Важные показатели ({platform === "wb" ? "Wildberries" : "Ozon"})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
                <MetricCard title="Расход за месяц" value={fmtRub(summary.spend_month)} />
                <MetricCard title="Выручка" value={fmtRub(summary.totals.revenue)} />
                <MetricCard title="Заказы" value={fmtInt(summary.total_orders)} />
                <MetricCard title="Средний ДРР" value={`${summary.avg_drr.toFixed(1)}%`} valueColor={summary.avg_drr > 25 ? T.red : summary.avg_drr > 15 ? T.yellow : T.green} />
              </div>
            </section>

            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📈 Краткая диагностика</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {summary.diagnostics.map((line) => (
                  <div key={line} style={{ fontSize: 12, color: T.sub }}>
                    {line}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {!summaryQuery.isLoading && mainTab === "dashboard" && dashboardTab === "planfact" && canEditPlanFact && (
          <PlanFactEditor
            platform={platform}
            current={planFact[platform]}
            summary={summary}
            budgetPct={budgetPct}
            drrDiff={drrDiff}
            onSave={(next) => setPlanFact((prev) => ({ ...prev, [platform]: next }))}
          />
        )}

        {mainTab === "bids" && (
          <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>💰 Контроль ставок и кампаний</div>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 10 }}>
              Основной контроль важных показателей по кампаниям. Детальное редактирование — в отдельных внутренних инструментах.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
              {campaigns.length === 0 && <div style={{ fontSize: 12, color: T.sub }}>Кампаний пока нет для выбранной площадки.</div>}
            </div>
          </section>
        )}

        {mainTab === "settings" && (
          <>
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>⚙️ Режим работы по API ключам</div>
              <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.7 }}>
                {runtimeDemoMode
                  ? "Сейчас нет активных API ключей — работает демо режим."
                  : hasWb && hasOzon
                  ? "Подключены WB и Ozon — обе площадки работают на реальных данных."
                  : hasWb
                  ? "Подключён только WB — реальный сбор WB, Ozon скрыт в дашборде."
                  : "Подключён только Ozon — реальный сбор Ozon, WB скрыт в дашборде."}
              </div>
            </section>

            <ApiSettingsBlock
              canManageApi={canApiManage}
              connectPending={connectMutation.isPending}
              accounts={accountsQuery.data || []}
              onConnect={(payload) => connectMutation.mutate(payload)}
            />

            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>👥 Сотрудники</div>
              <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.7 }}>
                Добавление, удаление и просмотр сотрудников выполняются только через Telegram-бот.
                <br />
                Команды: <code>/adduser</code>, <code>/remove_employee</code>, <code>/team</code>
              </div>
              {isOwner ? (
                <div style={{ marginTop: 10, color: T.green, fontSize: 12 }}>Вы как руководитель имеете полный доступ к управлению сотрудниками.</div>
              ) : (
                <div style={{ marginTop: 10, color: T.yellow, fontSize: 12 }}>
                  Изменение состава сотрудников доступно только руководителю.
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: `1px solid ${T.border}`,
          background: T.card,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "8px 10px"
        }}
      >
        <BottomButton active={mainTab === "dashboard"} onClick={() => setMainTab("dashboard")} label="🏠 Дашборд" />
        <BottomButton active={mainTab === "bids"} onClick={() => setMainTab("bids")} label="💰 Ставки" />
        <BottomButton active={mainTab === "settings"} onClick={() => setMainTab("settings")} label="⚙️ Настройки" />
      </div>
    </div>
  );
}

function BottomButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        cursor: "pointer",
        borderRadius: 10,
        color: active ? "#fff" : T.sub,
        background: active ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.05)",
        padding: "7px 14px",
        fontSize: 12
      }}
    >
      {label}
    </button>
  );
}

function MetricCard({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) {
  return (
    <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "monospace", color: valueColor || T.text }}>{value}</div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  return (
    <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{campaign.name}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: T.sub }}>
            Расход: {fmtRub(campaign.spend)} · Заказы: {fmtInt(campaign.orders)} · CTR: {campaign.ctr.toFixed(2)}%
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontFamily: "monospace", color: campaign.drr > 25 ? T.red : campaign.drr > 15 ? T.yellow : T.green }}>
            {campaign.drr.toFixed(1)}%
          </div>
          <div style={{ fontSize: 10, color: T.sub }}>ДРР</div>
        </div>
      </div>
    </div>
  );
}

function PlanFactEditor({
  platform,
  current,
  summary,
  budgetPct,
  drrDiff,
  onSave
}: {
  platform: Platform;
  current: PlanFactState;
  summary: Awaited<ReturnType<typeof getDashboardSummary>> | undefined;
  budgetPct: number | null;
  drrDiff: number | null;
  onSave: (value: PlanFactState) => void;
}) {
  const [drrInput, setDrrInput] = useState(current.drrTarget?.toString() || "");
  const [budgetInput, setBudgetInput] = useState(current.budget?.toString() || "");

  useEffect(() => {
    setDrrInput(current.drrTarget?.toString() || "");
    setBudgetInput(current.budget?.toString() || "");
  }, [current]);

  return (
    <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📋 План/Факт ({platform === "wb" ? "WB" : "Ozon"})</div>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          value={drrInput}
          onChange={(event) => setDrrInput(event.target.value)}
          type="number"
          placeholder="Целевой ДРР, %"
          style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
        />
        <input
          value={budgetInput}
          onChange={(event) => setBudgetInput(event.target.value)}
          type="number"
          placeholder="Бюджет, ₽"
          style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
        />
        <button
          onClick={() =>
            onSave({
              drrTarget: drrInput ? Number(drrInput) : null,
              budget: budgetInput ? Number(budgetInput) : null
            })
          }
          style={{ border: "none", borderRadius: 10, background: T.wb, color: "#fff", cursor: "pointer", padding: "10px 14px", fontWeight: 700 }}
        >
          Сохранить целевые значения
        </button>
      </div>

      {summary && (
        <div style={{ marginTop: 12, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, color: T.sub }}>
            Факт ДРР: <span style={{ color: T.text, fontWeight: 700 }}>{summary.avg_drr.toFixed(1)}%</span>
          </div>
          {drrDiff != null && (
            <div style={{ fontSize: 12, color: drrDiff > 0 ? T.red : T.green }}>
              Отклонение от цели: {drrDiff > 0 ? "+" : ""}
              {drrDiff.toFixed(1)}%
            </div>
          )}
          {budgetPct != null && (
            <div style={{ fontSize: 12, color: budgetPct > 90 ? T.red : budgetPct > 70 ? T.yellow : T.green }}>
              Освоение бюджета: {budgetPct}%
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ApiSettingsBlock({
  canManageApi,
  connectPending,
  accounts,
  onConnect
}: {
  canManageApi: boolean;
  connectPending: boolean;
  accounts: Account[];
  onConnect: (payload: { marketplace: "wb" | "ozon"; name: string; api_token?: string; client_id?: string; api_key?: string }) => void;
}) {
  const [marketplace, setMarketplace] = useState<Platform>("wb");
  const [name, setName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const wbAccounts = accounts.filter((item) => item.marketplace === "wb" && item.is_active);
  const ozonAccounts = accounts.filter((item) => item.marketplace === "ozon" && item.is_active);

  return (
    <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🔐 API ключи площадок</div>
      {!canManageApi && (
        <div style={{ fontSize: 12, color: T.yellow }}>
          Для вашей роли доступно только чтение. Менеджер не может менять API ключи.
        </div>
      )}

      {canManageApi && (
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <select
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value as Platform)}
            style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
          >
            <option value="wb">Wildberries</option>
            <option value="ozon">Ozon</option>
          </select>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название кабинета"
            style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
          />
          {marketplace === "wb" ? (
            <input
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder="WB API Token"
              style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
            />
          ) : (
            <>
              <input
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                placeholder="Ozon Client ID"
                style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
              />
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Ozon API Key"
                style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 10px", outline: "none" }}
              />
            </>
          )}
          <button
            disabled={connectPending || !name.trim()}
            onClick={() => {
              onConnect({
                marketplace,
                name,
                api_token: marketplace === "wb" ? apiToken : undefined,
                client_id: marketplace === "ozon" ? clientId : undefined,
                api_key: marketplace === "ozon" ? apiKey : undefined
              });
              setName("");
              setApiToken("");
              setClientId("");
              setApiKey("");
            }}
            style={{ border: "none", borderRadius: 10, background: marketplace === "wb" ? T.wb : T.ozon, color: "#fff", cursor: "pointer", padding: "10px 14px", fontWeight: 700, opacity: connectPending ? 0.7 : 1 }}
          >
            Подключить {marketplace === "wb" ? "WB" : "Ozon"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🟣 WB</div>
          {wbAccounts.length === 0 ? (
            <div style={{ fontSize: 11, color: T.sub }}>Нет подключённых аккаунтов</div>
          ) : (
            wbAccounts.map((item) => (
              <div key={item.id} style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>
                • {item.name}
              </div>
            ))
          )}
        </div>
        <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔵 Ozon</div>
          {ozonAccounts.length === 0 ? (
            <div style={{ fontSize: 11, color: T.sub }}>Нет подключённых аккаунтов</div>
          ) : (
            ozonAccounts.map((item) => (
              <div key={item.id} style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>
                • {item.name}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default App;
