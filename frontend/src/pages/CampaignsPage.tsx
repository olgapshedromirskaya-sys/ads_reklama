import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { listCampaigns, listQueries, pauseCampaign, resumeCampaign } from "@/api/endpoints";
import { canAccessExtendedFeatures } from "@/auth/roles";
import { CampaignFunnelPanel } from "@/components/CampaignFunnelPanel";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent, marketplaceLabel } from "@/components/metricUtils";
import { campaignsPath, campaignDetailPath, detectCampaignIssues } from "@/data/campaignInsights";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isDemoMode } from "@/demo/mode";
import { useAuthStore } from "@/store/auth";

type StatusFilter = "all" | "active" | "paused";

export function CampaignsPage({ marketplaceFilter }: { marketplaceFilter?: "wb" | "ozon" }) {
  const navigate = useNavigate();
  const demoMode = isDemoMode();
  const user = useAuthStore((state) => state.user);
  const extendedAccess = canAccessExtendedFeatures(user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns()
  });
  const queriesQuery = useQuery({
    queryKey: ["campaigns-queries", marketplaceFilter || "all"],
    queryFn: () => listQueries({ marketplace: marketplaceFilter, limit: 1000 })
  });

  const pauseMutation = useMutation({
    mutationFn: (campaignId: number) => pauseCampaign(campaignId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  const resumeMutation = useMutation({
    mutationFn: (campaignId: number) => resumeCampaign(campaignId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  const queryMap = useMemo(() => {
    const map = new Map<number, Awaited<ReturnType<typeof listQueries>>>();
    for (const row of queriesQuery.data || []) {
      const current = map.get(row.campaign_id) || [];
      current.push(row);
      map.set(row.campaign_id, current);
    }
    return map;
  }, [queriesQuery.data]);

  const filtered = useMemo(() => {
    const rows = (campaignsQuery.data || []).filter((item) => {
      if (!marketplaceFilter) return true;
      return item.marketplace === marketplaceFilter;
    });
    if (statusFilter === "all") {
      return rows;
    }
    return rows.filter((item) => item.status === statusFilter);
  }, [campaignsQuery.data, marketplaceFilter, statusFilter]);

  const rowsWithDiagnostics = useMemo(
    () =>
      filtered.map((campaign) => ({
        campaign,
        issues: detectCampaignIssues(campaign, queryMap.get(campaign.id) || [])
      })),
    [filtered, queryMap]
  );

  if (campaignsQuery.isLoading || queriesQuery.isLoading) {
    return <LoadingScreen text="Загрузка кампаний..." />;
  }
  if (campaignsQuery.isError || !campaignsQuery.data) {
    return <div className="text-sm text-red-500">Ошибка загрузки кампаний.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex gap-2">
          {[
            { key: "all", label: "Все" },
            { key: "active", label: "Активна" },
            { key: "paused", label: "На паузе" }
          ].map((value) => (
            <button
              key={value.key}
              onClick={() => setStatusFilter(value.key as StatusFilter)}
              className={`rounded-full px-3 py-1 ${
                statusFilter === value.key
                  ? "bg-[color:var(--tg-button-color)] text-white"
                  : "border border-slate-300/30"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
        {marketplaceFilter && (
          <Link to={campaignsPath(marketplaceFilter)} className="rounded-full border border-slate-300/30 px-3 py-1">
            {marketplaceFilter === "wb" ? "🟣 WB кампании" : "🔵 Ozon кампании"}
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300/30">
        <table className="min-w-[1380px] table-auto border-collapse text-xs">
          <thead>
            <tr className="bg-slate-500/10">
              <th className="px-2 py-2 text-left">Кампания</th>
              <th className="px-2 py-2">Маркетплейс</th>
              <th className="px-2 py-2">Показы</th>
              <th className="px-2 py-2">Клики</th>
              <th className="px-2 py-2">CTR</th>
              <th className="px-2 py-2">CPC</th>
              <th className="px-2 py-2">Заказы</th>
              <th className="px-2 py-2">CR</th>
              <th className="px-2 py-2">Расход</th>
              <th className="px-2 py-2">Выручка</th>
              <th className="px-2 py-2">ДРР</th>
              <th className="px-2 py-2">Проблемы</th>
              <th className="px-2 py-2">Статус</th>
              <th className="px-2 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithDiagnostics.map(({ campaign, issues }) => {
              const detailPath = campaignDetailPath(campaign.id, campaign.marketplace);
              const expanded = Boolean(expandedRows[campaign.id]);
              return (
                <Fragment key={campaign.id}>
                  <tr className="border-t border-slate-300/20">
                    <td className="px-2 py-2">
                      <Link className="font-semibold text-[color:var(--tg-link-color)] hover:underline" to={detailPath}>
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-2 py-2 text-center">{marketplaceLabel(campaign.marketplace)}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(campaign.impressions)}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(campaign.clicks)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${ctrColorClass(campaign.ctr)}`}>
                      {formatPercent(campaign.ctr, 1)}
                    </td>
                    <td className="px-2 py-2 text-center">{formatCurrency(campaign.cpc)}</td>
                    <td className="px-2 py-2 text-center">{formatInteger(campaign.orders)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${crColorClass(campaign.cr)}`}>
                      {formatPercent(campaign.cr, 1)}
                    </td>
                    <td className="px-2 py-2 text-center">{formatCurrency(campaign.spend)}</td>
                    <td className="px-2 py-2 text-center">{formatCurrency(campaign.revenue)}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${drrColorClass(campaign.drr)}`}>
                      {formatPercent(campaign.drr, 1)}
                    </td>
                    <td className={`px-2 py-2 text-center font-semibold ${issues.length ? "text-amber-300" : "text-emerald-300"}`}>
                      {issues.length ? `⚠️ ${issues.length}` : "✅ 0"}
                    </td>
                    <td className="px-2 py-2 text-center">{formatStatus(campaign.status)}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {extendedAccess && (
                          <>
                            <button
                              onClick={() => pauseMutation.mutate(campaign.id)}
                              className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                              disabled={demoMode && campaign.status === "paused"}
                            >
                              Пауза
                            </button>
                            <button
                              onClick={() => resumeMutation.mutate(campaign.id)}
                              className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                              disabled={demoMode && campaign.status === "active"}
                            >
                              Старт
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(detailPath)}
                          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                        >
                          Открыть
                        </button>
                        <button
                          onClick={() =>
                            setExpandedRows((prev) => ({
                              ...prev,
                              [campaign.id]: !prev[campaign.id]
                            }))
                          }
                          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                        >
                          {expanded ? "Скрыть воронку ▲" : "Развернуть воронку ▼"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="border-t border-slate-300/20">
                      <td colSpan={14} className="px-3 py-3">
                        <CampaignFunnelPanel campaign={campaign} issuesCount={issues.length} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rowsWithDiagnostics.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-5 text-center text-[color:var(--tg-hint-color)]">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatStatus(status?: string | null) {
  if (status === "active") return "Активна";
  if (status === "paused") return "На паузе";
  return status || "—";
}
