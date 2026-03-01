import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAlerts, markAlertsRead } from "@/api/endpoints";
import { LoadingScreen } from "@/components/LoadingScreen";

export function AlertsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [unreadOnly, setUnreadOnly] = useState(false);

  const alertsQuery = useQuery({
    queryKey: ["alerts", unreadOnly],
    queryFn: () => listAlerts(unreadOnly)
  });

  const markReadMutation = useMutation({
    mutationFn: markAlertsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setSelected({});
    }
  });

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, enabled]) => enabled)
        .map(([id]) => Number(id)),
    [selected]
  );

  if (alertsQuery.isLoading) {
    return <LoadingScreen text="Загрузка уведомлений..." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnreadOnly((prev) => !prev)}
          className="rounded-md border border-slate-300/30 px-3 py-2 text-xs"
        >
          {unreadOnly ? "Показать все" : "Только непрочитанные"}
        </button>
        <button
          onClick={() => markReadMutation.mutate(selectedIds)}
          className="rounded-md bg-[color:var(--tg-button-color)] px-3 py-2 text-xs text-white"
          disabled={!selectedIds.length}
        >
          Отметить прочитанным
        </button>
      </div>

      {(alertsQuery.data || []).map((alert) => (
        <div key={alert.id} className="rounded-xl border border-slate-300/30 p-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={Boolean(selected[alert.id])}
              onChange={(event) =>
                setSelected((prev) => ({
                  ...prev,
                  [alert.id]: event.target.checked
                }))
              }
            />
            <div>
              <div className="text-sm font-semibold">
                [{alert.type}] {alert.is_read ? "прочитано" : "новое"}
              </div>
              <div className="text-sm">{alert.message}</div>
              <div className="mt-1 text-xs text-[color:var(--tg-hint-color)]">
                {new Date(alert.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}

      {!alertsQuery.data?.length && (
        <div className="text-sm text-[color:var(--tg-hint-color)]">Уведомлений нет</div>
      )}
    </div>
  );
}
