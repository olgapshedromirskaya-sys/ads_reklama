import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTeamMember,
  connectAccount,
  listAccounts,
  listCampaigns,
  listTeamMembers,
  refreshAccount,
  removeTeamMember,
  setCampaignAutoMinus
} from "@/api/endpoints";
import { canManageTeam, canViewTeam } from "@/auth/roles";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/store/auth";

type Marketplace = "wb" | "ozon";
type EmployeeRole = "admin" | "manager";

function marketplaceLabel(marketplace: Marketplace) {
  return marketplace === "wb" ? "Wildberries" : "Ozon";
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const teamViewAllowed = canViewTeam(user);
  const teamManageAllowed = canManageTeam(user);
  const [marketplace, setMarketplace] = useState<Marketplace>("wb");
  const [name, setName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [employeeTelegramId, setEmployeeTelegramId] = useState("");
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [employeeRole, setEmployeeRole] = useState<EmployeeRole>("manager");

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const campaignsQuery = useQuery({ queryKey: ["campaigns"], queryFn: () => listCampaigns() });
  const teamQuery = useQuery({
    queryKey: ["team-members"],
    queryFn: listTeamMembers,
    enabled: teamViewAllowed
  });

  const connectMutation = useMutation({
    mutationFn: connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setName("");
      setApiToken("");
      setClientId("");
      setApiKey("");
    }
  });

  const refreshMutation = useMutation({
    mutationFn: refreshAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] })
  });

  const toggleAutoMinusMutation = useMutation({
    mutationFn: ({ campaignId, enabled }: { campaignId: number; enabled: boolean }) =>
      setCampaignAutoMinus(campaignId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign"] });
    }
  });

  const addEmployeeMutation = useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setEmployeeTelegramId("");
      setEmployeeUsername("");
      setEmployeeRole("manager");
    }
  });

  const removeEmployeeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    }
  });

  if (accountsQuery.isLoading || campaignsQuery.isLoading || (teamViewAllowed && teamQuery.isLoading)) {
    return <LoadingScreen text="Загрузка настроек..." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Подключить аккаунт</div>
        <div className="space-y-2">
          <select
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value as Marketplace)}
            className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            <option value="wb">Wildberries</option>
            <option value="ozon">Ozon</option>
          </select>
          <label className="space-y-1">
            <div className="text-xs text-[color:var(--tg-hint-color)]">Название аккаунта</div>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Название аккаунта"
              className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
          </label>

          {marketplace === "wb" ? (
            <input
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder="API Token"
              className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
          ) : (
            <>
              <input
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                placeholder="Client ID"
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="API Key"
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
            </>
          )}

          <button
            onClick={() =>
              connectMutation.mutate({
                marketplace,
                name,
                api_token: marketplace === "wb" ? apiToken : undefined,
                client_id: marketplace === "ozon" ? clientId : undefined,
                api_key: marketplace === "ozon" ? apiKey : undefined
              })
            }
            className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-white"
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {accountsQuery.data?.map((account) => (
          <div key={account.id} className="rounded-xl border border-slate-300/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{account.name}</div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  Маркетплейс: {marketplaceLabel(account.marketplace)} • {account.is_active ? "Включена" : "Выключена"}
                </div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  Последняя синхронизация: {account.last_synced_at ? new Date(account.last_synced_at).toLocaleString() : "—"}
                </div>
                {account.needs_reconnection && (
                  <div className="mt-1 text-xs text-rose-500">Требуется переподключение аккаунта.</div>
                )}
              </div>
              <button
                onClick={() => refreshMutation.mutate(account.id)}
                className="rounded-md border border-slate-300/30 px-2 py-1 text-xs"
              >
                Обновить
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamViewAllowed && (
        <div className="rounded-xl border border-slate-300/30 p-3">
          <div className="mb-2 text-sm font-semibold">Сотрудники и роли</div>
          {teamManageAllowed && (
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
              <input
                value={employeeTelegramId}
                onChange={(event) => setEmployeeTelegramId(event.target.value)}
                placeholder="Telegram ID"
                className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
              <input
                value={employeeUsername}
                onChange={(event) => setEmployeeUsername(event.target.value)}
                placeholder="@username (опц.)"
                className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
              <select
                value={employeeRole}
                onChange={(event) => setEmployeeRole(event.target.value as EmployeeRole)}
                className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              >
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
              </select>
              <button
                onClick={() => {
                  const telegramId = Number(employeeTelegramId);
                  if (!Number.isFinite(telegramId) || telegramId <= 0) {
                    return;
                  }
                  addEmployeeMutation.mutate({
                    telegram_id: telegramId,
                    username: employeeUsername.trim() ? employeeUsername.trim().replace(/^@/, "") : undefined,
                    role: employeeRole
                  });
                }}
                disabled={addEmployeeMutation.isPending}
                className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                Добавить сотрудника
              </button>
            </div>
          )}
          {!teamManageAllowed && (
            <div className="mb-3 text-xs text-[color:var(--tg-hint-color)]">
              Роль администратора: просмотр команды доступен, добавление и удаление сотрудников — только для руководителя.
            </div>
          )}
          <div className="space-y-2">
            {teamQuery.data?.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border border-slate-300/30 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold">{member.username ? `@${member.username}` : member.telegram_id}</div>
                  <div className="text-xs text-[color:var(--tg-hint-color)]">Роль: {roleLabel(member.role)}</div>
                </div>
                {teamManageAllowed && (
                  <button
                    onClick={() => removeEmployeeMutation.mutate(member.id)}
                    disabled={removeEmployeeMutation.isPending}
                    className="rounded-md border border-rose-500/50 px-2 py-1 text-xs text-rose-700 disabled:opacity-60"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
            {!teamQuery.data?.length && <div className="text-xs text-[color:var(--tg-hint-color)]">Сотрудников пока нет.</div>}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Настройки кампаний</div>
        <div className="space-y-2">
          {campaignsQuery.data?.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between rounded-md border border-slate-300/30 px-3 py-2">
              <div>
                <div className="text-sm font-semibold">{campaign.name}</div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  Авто-минусовка: {campaign.auto_minus_enabled ? "Включена" : "Выключена"}
                </div>
              </div>
              <button
                onClick={() =>
                  toggleAutoMinusMutation.mutate({
                    campaignId: campaign.id,
                    enabled: !campaign.auto_minus_enabled
                  })
                }
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  campaign.auto_minus_enabled ? "bg-emerald-600 text-white" : "border border-slate-300/30"
                }`}
              >
                {campaign.auto_minus_enabled ? "ВЫКЛ" : "ВКЛ"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function roleLabel(role: "director" | "admin" | "manager") {
  if (role === "director") return "Руководитель";
  if (role === "admin") return "Администратор";
  return "Менеджер";
}
