import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCampaign, getCampaignStats, listQueries } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);

  const campaignQuery = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: Number.isFinite(campaignId)
  });
  const statsQuery = useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: () => getCampaignStats(campaignId, 30),
    enabled: Number.isFinite(campaignId)
  });
  const queriesQuery = useQuery({
    queryKey: ["campaign-queries-top", campaignId],
    queryFn: () => listQueries({ campaign_id: campaignId, limit: 200 }),
    enabled: Number.isFinite(campaignId)
  });

  if (campaignQuery.isLoading || statsQuery.isLoading || queriesQuery.isLoading) {
    return <LoadingScreen text="Loading campaign details..." />;
  }
  if (!campaignQuery.data || !statsQuery.data || !queriesQuery.data) {
    return <div className="text-sm text-red-500">Failed to load campaign details.</div>;
  }

  const chartData = statsQuery.data.map((row) => ({
    ...row,
    day: row.date.slice(5)
  }));

  const topByOrders = [...queriesQuery.data]
    .sort((a, b) => b.orders - a.orders || b.ctr - a.ctr)
    .slice(0, 5);
  const wasted = [...queriesQuery.data]
    .filter((item) => item.orders === 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  const avgDrr = useMemo(() => {
    if (!statsQuery.data.length) {
      return 0;
    }
    return statsQuery.data.reduce((acc, row) => acc + row.drr, 0) / statsQuery.data.length;
  }, [statsQuery.data]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="text-sm font-semibold">{campaignQuery.data.name}</div>
        <div className="text-xs text-[color:var(--tg-hint-color)]">
          {campaignQuery.data.type} • {campaignQuery.data.status} • DRR avg {avgDrr.toFixed(2)}%
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Daily metrics (30d)</div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="spend" name="Spend" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="drr" name="DRR %" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TopList title="Top keywords by orders" rows={topByOrders.map((q) => `${q.query} (${q.orders} orders)`)} />
      <TopList title="Top wasted keywords" rows={wasted.map((q) => `${q.query} (${q.spend.toFixed(2)} ₽)`)} />
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-xl border border-slate-300/30 p-3">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <ul className="space-y-1 text-xs">
        {rows.length === 0 && <li className="text-[color:var(--tg-hint-color)]">No data yet</li>}
        {rows.map((item) => (
          <li key={item} className="rounded-md bg-slate-500/10 px-2 py-1">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
