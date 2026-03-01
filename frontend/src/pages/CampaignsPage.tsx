import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { listCampaigns, pauseCampaign, resumeCampaign } from "@/api/endpoints";
import { canAccessExtendedFeatures } from "@/auth/roles";
import { crColorClass, ctrColorClass, drrColorClass, formatCurrency, formatInteger, formatPercent, marketplaceLabel } from "@/components/metricUtils";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isDemoMode } from "@/demo/mode";
import { useAuthStore } from "@/store/auth";

export function CampaignsPage() {
  const navigate = useNavigate();
  const demoMode = isDemoMode();
  const user = useAuthStore((state) => state.user);
  const extendedAccess = canAccessExtendedFeatures(user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns()
  });

  const pauseMutation = useMutation({
    mutationFn: (campaignId: number) => pauseCampaign(campaignId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  const resumeMutation = useMutation({
    mutationFn: (campaignId: number) => resumeCampaign(campaignId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  const filtered = useMemo(() => {
    if (!data) {
      return [];
    }
    if (statusFilter === "all") {
      return data;
    }
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  if (isLoading) {
    return <LoadingScreen text="Загрузка кампаний..." />;
  }
  if (isError || !data) {
    return <div className="text-sm text-red-500">Ошибка загрузки кампаний.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs">
        {[
          { key: "all", label: "Все" },
          { key: "active", label: "Активна" },
          { key: "paused", label: "На паузе" }
        ].map((value) => (
          <button
            key={value.key}
            onClick={() => setStatusFilter(value.key)}
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

      <div className="overflow-x-auto rounded-xl border border-slate-300/30">
        <table className="min-w-[1250px] table-auto border-collapse text-xs">
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
              <th className="px-2 py-2">Статус</th>
              <th className="px-2 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((campaign) => (
              <tr key={campaign.id} className="border-t border-slate-300/20">
                <td className="px-2 py-2">
                  <Link
                    className="font-semibold text-[color:var(--tg-link-color)] hover:underline"
                    to={`/campaigns/${campaign.id}`}
                  >
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
                          Поставить на паузу
                        </button>
                        <button
                          onClick={() => resumeMutation.mutate(campaign.id)}
                          className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                          disabled={demoMode && campaign.status === "active"}
                        >
                          Возобновить
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="rounded-md border border-slate-300/30 px-2 py-1 text-[11px]"
                    >
                      Открыть
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-5 text-center text-[color:var(--tg-hint-color)]">
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
