import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectAccount, listAccounts, refreshAccount } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";

type Marketplace = "wb" | "ozon";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [marketplace, setMarketplace] = useState<Marketplace>("wb");
  const [name, setName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: listAccounts
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

  const wbAccounts = useMemo(
    () => (accountsQuery.data || []).filter((item) => item.marketplace === "wb"),
    [accountsQuery.data]
  );
  const ozonAccounts = useMemo(
    () => (accountsQuery.data || []).filter((item) => item.marketplace === "ozon"),
    [accountsQuery.data]
  );

  function handleSave() {
    connectMutation.mutate({
      marketplace,
      name,
      api_token: marketplace === "wb" ? apiToken : undefined,
      client_id: marketplace === "ozon" ? clientId : undefined,
      api_key: marketplace === "ozon" ? apiKey : undefined
    });
  }

  if (accountsQuery.isLoading) {
    return <LoadingScreen text="Загрузка настроек..." />;
  }

  return (
    <div className="space-y-4">
      <section className="app-card p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-100">Подключение аккаунта</h2>
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
            onClick={handleSave}
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
