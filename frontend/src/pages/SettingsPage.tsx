import { useState } from "react";
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

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });

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

  if (accountsQuery.isLoading) {
    return <LoadingScreen text="Loading settings..." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Connect marketplace account</div>
        <div className="space-y-2">
          <select
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value as Marketplace)}
            className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            <option value="wb">Wildberries</option>
            <option value="ozon">Ozon</option>
          </select>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Account name"
            className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          />

          {marketplace === "wb" ? (
            <input
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder="WB API token"
              className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
            />
          ) : (
            <>
              <input
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                placeholder="Ozon Client-ID"
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
              />
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Ozon API-Key"
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
            Connect account
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
                  {account.marketplace} • {account.is_active ? "active" : "inactive"}
                </div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  Last synced: {account.last_synced_at ? new Date(account.last_synced_at).toLocaleString() : "n/a"}
                </div>
                {account.needs_reconnection && (
                  <div className="mt-1 text-xs text-rose-500">Credentials invalid. Reconnect is required.</div>
                )}
              </div>
              <button
                onClick={() => refreshMutation.mutate(account.id)}
                className="rounded-md border border-slate-300/30 px-2 py-1 text-xs"
              >
                Refresh
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
