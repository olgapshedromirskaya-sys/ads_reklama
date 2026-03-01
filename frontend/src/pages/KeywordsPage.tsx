import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { createWatchlist, deleteWatchlist, getKeywordPositions, listAccounts, listWatchlist } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";

export function KeywordsPage() {
  const queryClient = useQueryClient();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [form, setForm] = useState({
    account_id: 0,
    article_id: "",
    keyword: "",
    target_position: ""
  });

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const watchlistQuery = useQuery({ queryKey: ["watchlist"], queryFn: listWatchlist });
  const positionQuery = useQuery({
    queryKey: ["watchlist-positions", selectedWatchlistId],
    queryFn: () => getKeywordPositions(Number(selectedWatchlistId), 30),
    enabled: Boolean(selectedWatchlistId)
  });

  const createMutation = useMutation({
    mutationFn: createWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setForm((prev) => ({ ...prev, article_id: "", keyword: "", target_position: "" }));
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] })
  });

  const chartData = useMemo(
    () =>
      (positionQuery.data || []).map((row) => ({
        d: row.date.slice(5),
        organic: row.organic_position ?? null,
        paid: row.paid_position ?? null
      })),
    [positionQuery.data]
  );

  if (accountsQuery.isLoading || watchlistQuery.isLoading) {
    return <LoadingScreen text="Loading watchlist..." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Add keyword to watchlist</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <select
            value={form.account_id || ""}
            onChange={(event) => setForm((prev) => ({ ...prev, account_id: Number(event.target.value) }))}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            <option value="">Select account</option>
            {accountsQuery.data?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.marketplace})
              </option>
            ))}
          </select>
          <input
            value={form.article_id}
            onChange={(event) => setForm((prev) => ({ ...prev, article_id: event.target.value }))}
            placeholder="Article / SKU"
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          />
          <input
            value={form.keyword}
            onChange={(event) => setForm((prev) => ({ ...prev, keyword: event.target.value }))}
            placeholder="Keyword"
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          />
          <input
            value={form.target_position}
            onChange={(event) => setForm((prev) => ({ ...prev, target_position: event.target.value }))}
            placeholder="Target position"
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          />
        </div>
        <button
          onClick={() =>
            createMutation.mutate({
              account_id: form.account_id,
              article_id: form.article_id,
              keyword: form.keyword,
              target_position: form.target_position ? Number(form.target_position) : null
            })
          }
          className="mt-2 rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-white"
        >
          Add to watchlist
        </button>
      </div>

      <div className="space-y-2">
        {watchlistQuery.data?.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-300/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => setSelectedWatchlistId(item.id)} className="text-left">
                <div className="text-sm font-semibold">{item.keyword}</div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  SKU: {item.article_id} • target {item.target_position ?? "n/a"}
                </div>
              </button>
              <button onClick={() => deleteMutation.mutate(item.id)} className="rounded-md border border-slate-300/30 px-2 py-1 text-xs">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Position history</div>
        <div className="h-52">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="d" />
                <YAxis reversed />
                <Tooltip />
                <Line dataKey="organic" stroke="#3b82f6" dot={false} />
                <Line dataKey="paid" stroke="#f97316" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[color:var(--tg-hint-color)]">
              Select keyword to display history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
