import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCampaigns, pauseCampaign, resumeCampaign } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isDemoMode } from "@/demo/mode";

export function CampaignsPage() {
  const demoMode = isDemoMode();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaigns
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
    return <LoadingScreen text="Loading campaigns..." />;
  }
  if (isError || !data) {
    return <div className="text-sm text-red-500">Failed to load campaigns.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs">
        {["all", "active", "paused"].map((value) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-3 py-1 ${
              statusFilter === value ? "bg-[color:var(--tg-button-color)] text-white" : "border border-slate-300/30"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {filtered.map((campaign) => (
        <div key={campaign.id} className="rounded-xl border border-slate-300/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link className="text-sm font-semibold text-[color:var(--tg-link-color)]" to={`/campaigns/${campaign.id}`}>
                {campaign.name}
              </Link>
              <div className="text-xs text-[color:var(--tg-hint-color)]">
                #{campaign.id} • {formatMarketplace(campaign.marketplace, campaign.type)} • {formatStatus(campaign.status)}
              </div>
              <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
                Budget: {campaign.daily_budget ? `${Math.round(campaign.daily_budget).toLocaleString("en-US")} ₽/day` : "not set"}
                {campaign.avg_drr ? ` • DRR ${campaign.avg_drr.toFixed(1)}%` : ""}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => pauseMutation.mutate(campaign.id)}
                className="rounded-md border border-slate-300/30 px-2 py-1 text-xs"
                disabled={demoMode && campaign.status === "paused"}
              >
                Pause
              </button>
              <button
                onClick={() => resumeMutation.mutate(campaign.id)}
                className="rounded-md border border-slate-300/30 px-2 py-1 text-xs"
                disabled={demoMode && campaign.status === "active"}
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatStatus(status?: string | null) {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  return status || "n/a";
}

function formatMarketplace(marketplace?: "wb" | "ozon" | null, type?: string | null) {
  if (marketplace === "wb") return "WB";
  if (marketplace === "ozon") return "Ozon";
  return type || "unknown";
}
