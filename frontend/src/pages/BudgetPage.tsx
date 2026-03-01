import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBudgetRule, listBudgetRules, listCampaigns, toggleBudgetRule } from "@/api/endpoints";
import { apiClient } from "@/api/client";
import { LoadingScreen } from "@/components/LoadingScreen";

const RULE_TYPES = [
  { value: "daily_budget", label: "Daily budget" },
  { value: "weekly_budget", label: "Weekly budget" },
  { value: "monthly_budget", label: "Monthly budget" },
  { value: "drr", label: "DRR" },
  { value: "ctr_drop", label: "CTR drop" }
];

export function BudgetPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    campaign_id: 0,
    rule_type: "daily_budget",
    threshold: "",
    action: "pause_campaign",
    is_active: true
  });

  const campaignsQuery = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });
  const rulesQuery = useQuery({ queryKey: ["budget-rules"], queryFn: listBudgetRules });

  const createMutation = useMutation({
    mutationFn: createBudgetRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-rules"] });
      setForm((prev) => ({ ...prev, threshold: "" }));
    }
  });

  const toggleMutation = useMutation({
    mutationFn: toggleBudgetRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-rules"] })
  });

  const checkMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ triggered: number }>("/budget/check");
      return data;
    }
  });

  if (campaignsQuery.isLoading || rulesQuery.isLoading) {
    return <LoadingScreen text="Loading budget rules..." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-300/30 p-3">
        <div className="mb-2 text-sm font-semibold">Create budget rule</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <select
            value={form.campaign_id || ""}
            onChange={(event) => setForm((prev) => ({ ...prev, campaign_id: Number(event.target.value) }))}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            <option value="">Select campaign</option>
            {campaignsQuery.data?.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <select
            value={form.rule_type}
            onChange={(event) => setForm((prev) => ({ ...prev, rule_type: event.target.value }))}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            {RULE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            value={form.threshold}
            onChange={(event) => setForm((prev) => ({ ...prev, threshold: event.target.value }))}
            placeholder="Threshold"
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          />
          <select
            value={form.action}
            onChange={(event) => setForm((prev) => ({ ...prev, action: event.target.value }))}
            className="rounded-md border border-slate-300/30 bg-transparent px-2 py-2 text-sm"
          >
            <option value="pause_campaign">Auto pause</option>
            <option value="alert">Alert only</option>
          </select>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() =>
              createMutation.mutate({
                campaign_id: form.campaign_id,
                rule_type: form.rule_type,
                threshold: Number(form.threshold),
                action: form.action,
                is_active: form.is_active
              })
            }
            className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-white"
          >
            Save rule
          </button>
          <button
            onClick={() => checkMutation.mutate()}
            className="rounded-md border border-slate-300/30 px-3 py-2 text-xs"
          >
            Run checks now
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rulesQuery.data?.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-slate-300/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{rule.rule_type}</div>
                <div className="text-xs text-[color:var(--tg-hint-color)]">
                  Campaign #{rule.campaign_id} • threshold {rule.threshold} • action {rule.action}
                </div>
              </div>
              <button
                onClick={() => toggleMutation.mutate(rule.id)}
                className="rounded-md border border-slate-300/30 px-2 py-1 text-xs"
              >
                {rule.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
