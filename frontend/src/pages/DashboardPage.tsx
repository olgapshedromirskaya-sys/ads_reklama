import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getDashboardSummary } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";

const pieColors = ["#3b82f6", "#f97316"];

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    refetchInterval: 60_000
  });

  if (isLoading) {
    return <LoadingScreen text="Loading dashboard..." />;
  }

  if (isError || !data) {
    return <div className="text-sm text-red-500">Failed to load dashboard summary.</div>;
  }

  const drrColor =
    data.avg_drr < 10 ? "text-emerald-500" : data.avg_drr <= 20 ? "text-yellow-500" : "text-rose-500";
  const pieData = [
    { name: "WB", value: data.wb_spend },
    { name: "Ozon", value: data.ozon_spend }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Spend today" value={`${data.spend_today.toFixed(2)} ₽`} />
        <MetricCard title="Orders today" value={String(data.total_orders)} />
        <MetricCard title="Spend week" value={`${data.spend_week.toFixed(2)} ₽`} />
        <MetricCard title="Spend month" value={`${data.spend_month.toFixed(2)} ₽`} />
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-1 text-sm font-semibold">Average DRR</div>
        <div className={`text-2xl font-bold ${drrColor}`}>{data.avg_drr.toFixed(2)}%</div>
        <div className="text-xs text-[color:var(--tg-hint-color)]">
          Last synced: {data.last_synced_at ? new Date(data.last_synced_at).toLocaleString() : "n/a"}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300/30 p-4">
        <div className="mb-3 text-sm font-semibold">Spend by marketplace (today)</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-300/30 p-3">
      <div className="text-xs text-[color:var(--tg-hint-color)]">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
