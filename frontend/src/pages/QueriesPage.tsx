import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw, Search, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@/api/client";
import {
  applyMinusWords,
  getQueryTrends,
  generateMinusWords,
  listCampaigns,
  listMinusWords,
  listQueries,
  type QueryRow,
  updateQueryLabelsBulk
} from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isDemoMode } from "@/demo/mode";
import { DEMO_MINUS_PHRASES, DEMO_MINUS_WORDS } from "@/demo/mockApi";

type LabelValue = "relevant" | "not_relevant" | "pending";

function resolveRowLabel(row: QueryRow): LabelValue {
  return (row.label || row.relevance_hint || "pending") as LabelValue;
}

function rowClassName(row: QueryRow) {
  const label = resolveRowLabel(row);
  if (label === "relevant") return "bg-emerald-500/10";
  if (label === "not_relevant") return "bg-rose-500/10";
  return "bg-yellow-500/10";
}

function formatRub(amount: number) {
  return `${Math.round(amount).toLocaleString("en-US")}₽`;
}

function parseRubAmount(value: string) {
  const normalized = value.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function labelBadgeClass(label: LabelValue) {
  if (label === "relevant") {
    return "border-emerald-500/50 bg-emerald-500/15 text-emerald-700";
  }
  if (label === "not_relevant") {
    return "border-rose-500/50 bg-rose-500/15 text-rose-700";
  }
  return "border-yellow-500/50 bg-yellow-500/20 text-yellow-800";
}

function labelTitle(label: LabelValue) {
  if (label === "relevant") return "Релевантный";
  if (label === "not_relevant") return "Нерелевантный";
  return "На проверке";
}

export function QueriesPage() {
  const demoMode = isDemoMode();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [marketplace, setMarketplace] = useState<"" | "wb" | "ozon">("");
  const [campaignId, setCampaignId] = useState<number | "">("");
  const [ctrMax, setCtrMax] = useState<number>(10);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Record<number, QueryRow>>({});
  const [minusWords, setMinusWords] = useState<string[] | null>(null);
  const [applySummary, setApplySummary] = useState<{ applied: number; failed: number; savings: number } | null>(null);
  const [trendKeyword, setTrendKeyword] = useState("");

  const params = useMemo(
    () => ({
      q: searchText || undefined,
      marketplace: marketplace || undefined,
      campaign_id: campaignId || undefined,
      ctr_max: ctrMax,
      sort_by: sortBy,
      sort_dir: sortDir,
      limit: 1000
    }),
    [searchText, marketplace, campaignId, ctrMax, sortBy, sortDir]
  );

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaigns
  });
  const queriesQuery = useQuery({
    queryKey: ["queries", params],
    queryFn: () => listQueries(params),
    refetchInterval: 2 * 60_000
  });

  const trendQuery = useQuery({
    queryKey: ["query-trend", trendKeyword],
    queryFn: () => getQueryTrends(trendKeyword, 30),
    enabled: trendKeyword.length > 1
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ rows, label }: { rows: QueryRow[]; label: LabelValue }) => {
      const byCampaign = rows.reduce<Record<number, QueryRow[]>>((acc, row) => {
        acc[row.campaign_id] = acc[row.campaign_id] || [];
        acc[row.campaign_id].push(row);
        return acc;
      }, {});

      const minusRoots = new Set<string>();
      for (const [campaign, groupedRows] of Object.entries(byCampaign)) {
        const response = await updateQueryLabelsBulk(
          Number(campaign),
          groupedRows.map((row) => ({ query: row.query, label }))
        );
        response.generated_minus_words.forEach((item) => minusRoots.add(item));
      }
      return [...minusRoots];
    },
    onSuccess: (roots) => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      queryClient.invalidateQueries({ queryKey: ["queries-badge"] });
      if (roots.length) {
        setMinusWords(demoMode ? [...DEMO_MINUS_WORDS] : roots);
      }
      setSelected({});
    }
  });

  const generateMinusMutation = useMutation({
    mutationFn: async (rows: QueryRow[]) => {
      if (demoMode && rows.length === 0) {
        return [...DEMO_MINUS_WORDS];
      }
      const byCampaign = rows.reduce<Record<number, string[]>>((acc, row) => {
        acc[row.campaign_id] = acc[row.campaign_id] || [];
        acc[row.campaign_id].push(row.query);
        return acc;
      }, {});
      const roots = new Set<string>();
      for (const [campaign, queries] of Object.entries(byCampaign)) {
        const campaignRoots = await generateMinusWords(Number(campaign), queries);
        campaignRoots.forEach((item) => roots.add(item));
      }
      return [...roots];
    },
    onSuccess: (roots) => setMinusWords(demoMode ? [...DEMO_MINUS_WORDS] : roots)
  });

  const applyMinusWordsMutation = useMutation({
    mutationFn: async (campaignIds: number[]) => {
      const words = new Set<string>();
      let applied = 0;
      let failed = 0;
      let savings = 0;

      for (const campaign of campaignIds) {
        const result = await applyMinusWords(campaign);
        applied += result.applied;
        failed += result.failed;
        savings += parseRubAmount(result.saved_budget_estimate);
        const campaignMinusWords = await listMinusWords(campaign);
        campaignMinusWords.forEach((item) => words.add(item.word_root));
      }

      return { applied, failed, savings, words: [...words] };
    },
    onSuccess: (result) => {
      setApplySummary({ applied: result.applied, failed: result.failed, savings: result.savings });
      setMinusWords(demoMode ? [...DEMO_MINUS_WORDS] : result.words);
      queryClient.invalidateQueries({ queryKey: ["queries"] });
      queryClient.invalidateQueries({ queryKey: ["queries-badge"] });
      setSelected({});
    }
  });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }
    const selectedRows = Object.values(selected);
    const handleMainButton = () => {
      if (selectedRows.length === 0) return;
      bulkMutation.mutate({ rows: selectedRows, label: "not_relevant" });
    };

    if (selectedRows.length > 0) {
      webApp.MainButton.setParams({
        text: `Mark not relevant (${selectedRows.length})`,
        is_visible: true
      });
      webApp.MainButton.show();
      webApp.MainButton.onClick(handleMainButton);
    } else {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(handleMainButton);
    }

    return () => {
      webApp.MainButton.offClick(handleMainButton);
    };
  }, [selected, bulkMutation]);

  const selectedRows = Object.values(selected);
  const rows = queriesQuery.data || [];
  const loading = campaignsQuery.isLoading || queriesQuery.isLoading;
  const campaignIdsInScope = useMemo(() => {
    if (campaignId) {
      return [Number(campaignId)];
    }
    return [...new Set(rows.map((row) => row.campaign_id))];
  }, [campaignId, rows]);
  const allCampaignIds = useMemo(
    () => [...new Set((campaignsQuery.data || []).map((campaign) => campaign.id))],
    [campaignsQuery.data]
  );
  const querySummary = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          const label = resolveRowLabel(row);
          if (label === "relevant") {
            acc.relevant += 1;
            acc.relevantSpend += row.spend;
          } else if (label === "not_relevant") {
            acc.notRelevant += 1;
            acc.notRelevantSpend += row.spend;
          } else {
            acc.pending += 1;
            acc.pendingSpend += row.spend;
          }
          return acc;
        },
        {
          relevant: 0,
          pending: 0,
          notRelevant: 0,
          relevantSpend: 0,
          pendingSpend: 0,
          notRelevantSpend: 0
        }
      ),
    [rows]
  );
  const defaultSavingsPerDay = querySummary.notRelevantSpend;
  const savingsPerDay = applySummary?.savings || defaultSavingsPerDay;

  async function applyLabel(rowsToUpdate: QueryRow[], label: LabelValue) {
    if (!rowsToUpdate.length) return;
    setApplySummary(null);
    bulkMutation.mutate({ rows: rowsToUpdate, label });
  }

  function toggleSelection(row: QueryRow) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[row.id]) {
        delete next[row.id];
      } else {
        next[row.id] = row;
      }
      return next;
    });
  }

  function selectAllIrrelevant() {
    const candidates = rows.filter((row) => resolveRowLabel(row) === "not_relevant");
    const next: Record<number, QueryRow> = {};
    candidates.forEach((row) => {
      next[row.id] = row;
    });
    setSelected(next);
  }

  function runAutoMinusPipeline() {
    if (!campaignIdsInScope.length) return;
    setApplySummary(null);
    applyMinusWordsMutation.mutate(campaignIdsInScope);
  }

  function applyAllMinusWordsBulk() {
    if (!allCampaignIds.length) return;
    setApplySummary(null);
    applyMinusWordsMutation.mutate(allCampaignIds);
  }

  async function exportXlsx() {
    if (demoMode) {
      const lines = [
        "query,impressions,clicks,ctr,spend,orders,label,campaign,marketplace",
        ...rows.map((row) =>
          [
            csvEscape(row.query),
            row.impressions,
            row.clicks,
            row.ctr.toFixed(2),
            row.spend.toFixed(2),
            row.orders,
            resolveRowLabel(row),
            csvEscape(row.campaign_name || ""),
            row.marketplace || ""
          ].join(",")
        )
      ];
      const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "queries_export_demo.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      return;
    }

    const { data } = await apiClient.get("/queries/export.xlsx", {
      responseType: "blob",
      params: { campaign_id: campaignId || undefined }
    });
    const url = URL.createObjectURL(new Blob([data]));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "queries_export.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <LoadingScreen text="Loading queries..." />;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Search size={16} className="text-[color:var(--tg-hint-color)]" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search query text..."
            className="w-full rounded-md border border-slate-300/30 bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          <select
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value as "" | "wb" | "ozon")}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2"
          >
            <option value="">All MP</option>
            <option value="wb">WB</option>
            <option value="ozon">Ozon</option>
          </select>

          <select
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value ? Number(event.target.value) : "")}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2"
          >
            <option value="">All campaigns</option>
            {campaignsQuery.data?.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>

          <div className="rounded-md border border-slate-300/30 px-2 py-2">
            <div className="text-[10px] text-[color:var(--tg-hint-color)]">CTR max (%)</div>
            <input
              type="range"
              min={1}
              max={20}
              value={ctrMax}
              onChange={(event) => setCtrMax(Number(event.target.value))}
              className="w-full"
            />
            <div className="text-right text-[10px]">{ctrMax.toFixed(1)}</div>
          </div>

          <div className="rounded-md border border-slate-300/30 px-2 py-2">
            <div className="text-[10px] text-[color:var(--tg-hint-color)]">Sort</div>
            <div className="mt-1 flex gap-1">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-md border border-slate-300/30 bg-transparent px-1 py-1 text-xs"
              >
                <option value="date">Date</option>
                <option value="impressions">Impr.</option>
                <option value="clicks">Clicks</option>
                <option value="ctr">CTR</option>
                <option value="spend">Spend</option>
                <option value="orders">Orders</option>
                <option value="cpo">CPO</option>
              </select>
              <button
                onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="rounded-md border border-slate-300/30 px-2"
              >
                {sortDir}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={selectAllIrrelevant}
          className="rounded-md border border-slate-300/30 px-3 py-2 text-xs"
        >
          Выбрать все нерелевантные
        </button>
        <button
          onClick={() => applyLabel(selectedRows, "relevant")}
          className="rounded-md bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-50"
          disabled={!selectedRows.length}
        >
          Mark relevant
        </button>
        <button
          onClick={() => applyLabel(selectedRows, "not_relevant")}
          className="rounded-md bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-50"
          disabled={!selectedRows.length}
        >
          Mark not relevant
        </button>
        <button
          onClick={() => applyLabel(selectedRows, "pending")}
          className="rounded-md bg-yellow-500 px-3 py-2 text-xs text-black disabled:opacity-50"
          disabled={!selectedRows.length}
        >
          Mark pending
        </button>
        <button
          onClick={() => generateMinusMutation.mutate(selectedRows)}
          className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-white disabled:opacity-50"
          disabled={!selectedRows.length}
        >
          Generate minus-words
        </button>
        <button
          onClick={runAutoMinusPipeline}
          className="rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          disabled={!campaignIdsInScope.length || applyMinusWordsMutation.isPending}
        >
          Авто-минусовка
        </button>
        <button
          onClick={applyAllMinusWordsBulk}
          className="rounded-md border border-violet-500/60 px-3 py-2 text-xs font-semibold text-violet-700 disabled:opacity-50"
          disabled={!allCampaignIds.length || applyMinusWordsMutation.isPending}
        >
          Применить все минус-слова
        </button>
        <button onClick={exportXlsx} className="rounded-md border border-slate-300/30 px-3 py-2 text-xs">
          <Download size={14} className="mr-1 inline" />
          Export .xlsx
        </button>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["queries"] })}
          className="rounded-md border border-slate-300/30 px-3 py-2 text-xs"
        >
          <RefreshCw size={14} className="mr-1 inline" />
          Refresh
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
          <div className="text-[11px] text-emerald-700">Relevant</div>
          <div className="text-lg font-semibold">{querySummary.relevant}</div>
          <div className="text-xs text-[color:var(--tg-hint-color)]">{formatRub(querySummary.relevantSpend)}/день</div>
        </div>
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3">
          <div className="text-[11px] text-yellow-800">Pending</div>
          <div className="text-lg font-semibold">{querySummary.pending}</div>
          <div className="text-xs text-[color:var(--tg-hint-color)]">{formatRub(querySummary.pendingSpend)}/день</div>
        </div>
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
          <div className="text-[11px] text-rose-700">Not relevant</div>
          <div className="text-lg font-semibold">{querySummary.notRelevant}</div>
          <div className="text-xs text-[color:var(--tg-hint-color)]">{formatRub(querySummary.notRelevantSpend)}/день</div>
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-3">
        <div className="text-sm font-semibold">
          {`Применение минус-слов сэкономит ~${formatRub(savingsPerDay)}/день (${formatRub(savingsPerDay * 30)}/месяц)`}
        </div>
        {applySummary && (
          <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
            Применено: {applySummary.applied}, ошибок: {applySummary.failed}
          </div>
        )}
      </div>

      {demoMode && (
        <div className="rounded-xl border border-yellow-400/50 bg-yellow-100/30 p-3">
          <div className="text-sm font-semibold">Demo minus-words generator</div>
          <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">Detected irrelevant words:</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {DEMO_MINUS_WORDS.map((word) => (
              <span
                key={word}
                className="rounded-full border border-rose-400/50 bg-rose-100/60 px-2 py-1 text-[11px] font-semibold text-rose-700"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-[color:var(--tg-hint-color)]">Generated minus-phrases (ready to copy):</div>
          <textarea
            readOnly
            value={buildDemoMinusPhraseList().join("\n")}
            className="mt-2 h-28 w-full rounded-md border border-yellow-400/50 bg-transparent p-2 text-xs"
          />
          <div className="mt-2">
            <button
              onClick={() => navigator.clipboard.writeText(buildDemoMinusPhraseList().join("\n"))}
              className="rounded-md bg-yellow-500 px-3 py-2 text-xs font-semibold text-yellow-950"
            >
              Copy minus-phrases
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-300/30">
        <table className="min-w-[980px] table-auto border-collapse text-xs">
          <thead>
            <tr className="bg-slate-500/10">
              <th className="sticky left-0 z-10 bg-slate-500/20 px-2 py-2 text-left">Query</th>
              <th className="px-2 py-2">Select</th>
              <th className="px-2 py-2">Impr.</th>
              <th className="px-2 py-2">Clicks</th>
              <th className="px-2 py-2">CTR</th>
              <th className="px-2 py-2">Spend</th>
              <th className="px-2 py-2">Orders</th>
              <th className="px-2 py-2">CR</th>
              <th className="px-2 py-2">CPO</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const label = resolveRowLabel(row);
              const cr = row.clicks > 0 ? (row.orders / row.clicks) * 100 : 0;
              return (
                <tr key={row.id} className={rowClassName(row)}>
                  <td className="sticky left-0 bg-inherit px-2 py-2 font-medium">{row.query}</td>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" checked={Boolean(selected[row.id])} onChange={() => toggleSelection(row)} />
                  </td>
                  <td className="px-2 py-2 text-center">{row.impressions}</td>
                  <td className="px-2 py-2 text-center">{row.clicks}</td>
                  <td className="px-2 py-2 text-center">{row.ctr.toFixed(2)}%</td>
                  <td className="px-2 py-2 text-center">{row.spend.toFixed(2)}</td>
                  <td className="px-2 py-2 text-center">{row.orders}</td>
                  <td className="px-2 py-2 text-center">{cr.toFixed(2)}%</td>
                  <td className="px-2 py-2 text-center">{row.cpo.toFixed(2)}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${labelBadgeClass(label)}`}>
                      {labelTitle(label)}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => applyLabel([row], "relevant")}
                        className="rounded border border-emerald-500 px-1 py-0.5"
                        title="Relevant"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => applyLabel([row], "not_relevant")}
                        className="rounded border border-rose-500 px-1 py-0.5"
                        title="Not relevant"
                      >
                        ❌
                      </button>
                      <button
                        onClick={() => applyLabel([row], "pending")}
                        className="rounded border border-yellow-500 px-1 py-0.5"
                        title="Pending"
                      >
                        📌
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-[color:var(--tg-hint-color)]">
                  No queries found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Keyword trend (30d)</div>
        <div className="mb-2 flex gap-2">
          <input
            value={trendKeyword}
            onChange={(event) => setTrendKeyword(event.target.value)}
            placeholder="Keyword for trend chart"
            className="w-full rounded-md border border-slate-300/30 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="h-44">
          {trendQuery.data?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendQuery.data.map((row) => ({ ...row, d: row.date.slice(5) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line dataKey="impressions" stroke="#3b82f6" dot={false} />
                <Line dataKey="clicks" stroke="#22c55e" dot={false} />
                <Line dataKey="spend" stroke="#f97316" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[color:var(--tg-hint-color)]">
              Enter a keyword to view trend.
            </div>
          )}
        </div>
      </div>

      {minusWords && (
        <MinusWordsModal
          words={minusWords}
          onClose={() => setMinusWords(null)}
          onCopy={async () => {
            await navigator.clipboard.writeText(minusWords.join("\n"));
          }}
        />
      )}
    </div>
  );
}

function buildDemoMinusPhraseList() {
  return DEMO_MINUS_PHRASES.map((phrase) => `- ${phrase}`);
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function MinusWordsModal({
  words,
  onClose,
  onCopy
}: {
  words: string[];
  onClose: () => void;
  onCopy: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-xl bg-[color:var(--tg-bg-color)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Generated minus-words</h3>
          <button className="rounded-md p-1" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <textarea
          readOnly
          value={words.join("\n")}
          className="h-48 w-full rounded-md border border-slate-300/30 bg-transparent p-2 text-xs"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-slate-300/30 px-3 py-2 text-xs">
            Close
          </button>
          <button
            onClick={onCopy}
            className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-[color:var(--tg-button-text-color)]"
          >
            Copy list
          </button>
        </div>
      </div>
    </div>
  );
}
