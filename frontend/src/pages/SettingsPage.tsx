import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployee, connectAccount, listAccounts, listEmployees, refreshAccount, removeEmployee } from "@/api/endpoints";
import { canManageApiKeys, canManageTeam, resolveUserRole } from "@/auth/roles";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/store/auth";

type Marketplace = "wb" | "ozon";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = resolveUserRole(user);
  const canApi = canManageApiKeys(user);
  const canEmployees = canManageTeam(user);

  const [marketplace, setMarketplace] = useState<Marketplace>("wb");
  const [name, setName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const [employeeTelegramId, setEmployeeTelegramId] = useState("");
  const [employeeRole, setEmployeeRole] = useState<"admin" | "manager">("manager");
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [employeeFullName, setEmployeeFullName] = useState("");

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: listAccounts,
    enabled: canApi
  });

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
    enabled: canEmployees
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

  const addEmployeeMutation = useMutation({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEmployeeTelegramId("");
      setEmployeeUsername("");
      setEmployeeFullName("");
      setEmployeeRole("manager");
    }
  });

  const removeEmployeeMutation = useMutation({
    mutationFn: removeEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] })
  });

  const wbAccounts = useMemo(
    () => (accountsQuery.data || []).filter((item) => item.marketplace === "wb" && item.is_active),
    [accountsQuery.data]
  );
  const ozonAccounts = useMemo(
    () => (accountsQuery.data || []).filter((item) => item.marketplace === "ozon" && item.is_active),
    [accountsQuery.data]
  );

  function handleSaveAccount() {
    connectMutation.mutate({
      marketplace,
      name,
      api_token: marketplace === "wb" ? apiToken : undefined,
      client_id: marketplace === "ozon" ? clientId : undefined,
      api_key: marketplace === "ozon" ? apiKey : undefined
    });
  }

  function handleAddEmployee() {
    const telegramId = Number(employeeTelegramId);
    if (!Number.isInteger(telegramId) || telegramId <= 0) {
      return;
    }
    addEmployeeMutation.mutate({
      telegram_id: telegramId,
      role: employeeRole,
      username: employeeUsername.trim() || undefined,
      full_name: employeeFullName.trim() || undefined
    });
  }

  if ((canApi && accountsQuery.isLoading) || (canEmployees && employeesQuery.isLoading)) {
    return <LoadingScreen text="Загрузка настроек..." />;
  }

  return (
    <div className="space-y-4">
      {!canApi && !canEmployees && (
        <section className="app-card p-4">
          <h2 className="text-sm font-bold text-slate-100">⚙️ Настройки</h2>
          <p className="mt-2 text-xs text-slate-300">Для вашей роли ({role}) разделы настроек ограничены.</p>
        </section>
      )}

      {canApi && (
        <>
          <section className="app-card p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-100">⚙️ API ключи</h2>
            <div className="space-y-3">
              <label className="block text-xs text-slate-300">
                Маркетплейс
                <select
                  value={marketplace}
                  onChange={(event) => setMarketplace(event.target.value as Marketplace)}
                  className="mt-1 w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="wb">Wildberries</option>
                  <option value="ozon">Ozon</option>
                </select>
              </label>

              <label className="block text-xs text-slate-300">
                Название аккаунта
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Название аккаунта"
                  className="mt-1 w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                />
              </label>

              {marketplace === "wb" ? (
                <label className="block text-xs text-slate-300">
                  API Token
                  <input
                    value={apiToken}
                    onChange={(event) => setApiToken(event.target.value)}
                    placeholder="Введите API Token WB"
                    className="mt-1 w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                  />
                </label>
              ) : (
                <>
                  <label className="block text-xs text-slate-300">
                    Client ID
                    <input
                      value={clientId}
                      onChange={(event) => setClientId(event.target.value)}
                      placeholder="Введите Client ID Ozon"
                      className="mt-1 w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                    />
                  </label>
                  <label className="block text-xs text-slate-300">
                    API Key
                    <input
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder="Введите API Key Ozon"
                      className="mt-1 w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                    />
                  </label>
                </>
              )}

              <button
                onClick={handleSaveAccount}
                disabled={connectMutation.isPending || !name.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Сохранить
              </button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <AccountsBlock title="🟣 Wildberries" accounts={wbAccounts} onRefresh={(id) => refreshMutation.mutate(id)} />
            <AccountsBlock title="🔵 Ozon" accounts={ozonAccounts} onRefresh={(id) => refreshMutation.mutate(id)} />
          </section>
        </>
      )}

      {canEmployees && (
        <section className="app-card p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-100">👥 Управление сотрудниками</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              value={employeeTelegramId}
              onChange={(event) => setEmployeeTelegramId(event.target.value)}
              placeholder="Telegram ID"
              className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
            <select
              value={employeeRole}
              onChange={(event) => setEmployeeRole(event.target.value as "admin" | "manager")}
              className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            >
              <option value="admin">Администратор</option>
              <option value="manager">Менеджер</option>
            </select>
            <input
              value={employeeUsername}
              onChange={(event) => setEmployeeUsername(event.target.value)}
              placeholder="@username (опционально)"
              className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
            <input
              value={employeeFullName}
              onChange={(event) => setEmployeeFullName(event.target.value)}
              placeholder="ФИО (опционально)"
              className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleAddEmployee}
            disabled={addEmployeeMutation.isPending || !employeeTelegramId.trim()}
            className="mt-3 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            Добавить сотрудника
          </button>

          <div className="mt-4 space-y-2">
            {(employeesQuery.data || []).map((employee) => (
              <div key={employee.telegram_id} className="flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-700/10 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {employee.username ? `@${employee.username}` : employee.full_name || `ID ${employee.telegram_id}`}
                  </div>
                  <div className="text-xs text-slate-300">
                    ID: {employee.telegram_id} • {employee.role === "owner" ? "Руководитель" : employee.role === "admin" ? "Администратор" : "Менеджер"}
                  </div>
                </div>
                {employee.role !== "owner" && (
                  <button
                    onClick={() => removeEmployeeMutation.mutate(employee.telegram_id)}
                    className="rounded-md border border-rose-400/40 px-2 py-1 text-xs text-rose-200"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
            {(employeesQuery.data || []).length === 0 && <div className="text-xs text-slate-400">Сотрудники не найдены</div>}
          </div>
        </section>
      )}
    </div>
  );
}

function AccountsBlock({
  title,
  accounts,
  onRefresh
}: {
  title: string;
  accounts: Array<{
    id: number;
    name: string;
    is_active: boolean;
    needs_reconnection: boolean;
    last_synced_at?: string | null;
  }>;
  onRefresh: (id: number) => void;
}) {
  return (
    <div className="app-card p-3">
      <h3 className="mb-2 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-lg border border-slate-500/30 bg-slate-700/10 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-100">{account.name}</div>
                <div className="text-xs text-slate-300">{account.is_active ? "Подключён" : "Отключён"}</div>
                <div className="text-xs text-slate-400">
                  Синхронизация: {account.last_synced_at ? new Date(account.last_synced_at).toLocaleString() : "—"}
                </div>
                {account.needs_reconnection && <div className="text-xs text-rose-300">Требуется переподключение</div>}
              </div>
              <button
                onClick={() => onRefresh(account.id)}
                className="rounded-md border border-slate-400/40 px-2 py-1 text-[11px] text-slate-200"
              >
                Обновить
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <div className="text-xs text-slate-400">Нет подключённых аккаунтов</div>}
      </div>
    </div>
  );
}
