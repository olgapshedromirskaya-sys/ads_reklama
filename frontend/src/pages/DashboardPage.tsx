import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { getDashboardSummary } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isDemoMode } from "@/demo/mode";
import { getDemoDailySpend } from "@/demo/mockApi";

const pieColors = ["#3b82f6", "#f97316"];

export function DashboardPage() {
  const demoMode = isDemoMode();
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
  const demoChartData = getDemoDailySpend().map((item) => ({
    ...item,
    day: item.date.slice(5)
  }));

  if (demoMode) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard title="Total spend this month" value={formatCurrency(data.spend_month)} />
          <MetricCard title="Orders from ads" value={formatCount(data.total_orders)} />
          <MetricCard title="Average DRR" value={`${data.avg_drr.toFixed(1)}%`} className="text-yellow-500" />
          <MetricCard title="WB spend" value={formatCurrency(data.wb_spend)} />
          <MetricCard title="Ozon spend" value={formatCurrency(data.ozon_spend)} />
        </div>

        <div className="rounded-xl border border-slate-300/30 p-4">
          <div className="mb-3 text-sm font-semibold">Daily spend (last 30 days)</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-300/30 p-4">
          <div className="mb-3 text-sm font-semibold">Spend by marketplace (month)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

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

function MetricCard({ title, value, className = "" }: { title: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-slate-300/30 p-3">
      <div className="text-xs text-[color:var(--tg-hint-color)]">{title}</div>
      <div className={`mt-1 text-lg font-semibold ${className}`}>{value}</div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} ₽`;
}

function formatCount(value: number) {
  return Math.round(value).toLocaleString("en-US");
}
