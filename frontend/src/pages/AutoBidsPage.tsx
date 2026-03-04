import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── Типы ────────────────────────────────────────────────────────────────────

type Campaign = {
  id: number;
  name: string;
  drr: number;
  currentBid: number;
  position: number;
  status: "active" | "paused";
};

type BidRule = {
  campaignId: number;
  enabled: boolean;
  targetDrr: number;
  targetPosition: number;
  minBid: number;
  maxBid: number;
};

type BidHistoryPoint = {
  time: string;
  bid: number;
  drr: number;
  position: number;
  reason?: string;
};

// ─── Демо данные ──────────────────────────────────────────────────────────────

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: 101, name: "Кроссовки женские", drr: 8.2, currentBid: 85, position: 3, status: "active" },
  { id: 102, name: "Платья летние", drr: 17.2, currentBid: 120, position: 8, status: "active" },
  { id: 103, name: "Джинсы slim fit", drr: 37.7, currentBid: 210, position: 2, status: "active" },
];

function generateBidHistory(campaignId: number): BidHistoryPoint[] {
  const histories: Record<number, BidHistoryPoint[]> = {
    101: [
      { time: "00:00", bid: 80, drr: 7.1, position: 4 },
      { time: "01:00", bid: 85, drr: 7.8, position: 3, reason: "↑ позиция упала" },
      { time: "02:00", bid: 85, drr: 8.0, position: 3 },
      { time: "03:00", bid: 85, drr: 7.9, position: 3 },
      { time: "04:00", bid: 80, drr: 6.5, position: 2, reason: "↓ ДРР < цели" },
      { time: "05:00", bid: 80, drr: 7.2, position: 3 },
      { time: "06:00", bid: 85, drr: 8.1, position: 4, reason: "↑ позиция упала" },
      { time: "07:00", bid: 85, drr: 8.5, position: 3 },
      { time: "08:00", bid: 90, drr: 9.1, position: 5, reason: "↑ позиция упала" },
      { time: "09:00", bid: 85, drr: 9.8, position: 3, reason: "↓ ДРР > цели" },
      { time: "10:00", bid: 85, drr: 8.9, position: 3 },
      { time: "11:00", bid: 85, drr: 8.2, position: 3 },
      { time: "12:00", bid: 85, drr: 8.2, position: 3 },
    ],
    102: [
      { time: "00:00", bid: 130, drr: 15.2, position: 6 },
      { time: "01:00", bid: 115, drr: 16.1, position: 5, reason: "↓ ДРР > цели" },
      { time: "02:00", bid: 110, drr: 17.5, position: 6, reason: "↓ ДРР > цели" },
      { time: "03:00", bid: 105, drr: 18.2, position: 7, reason: "↓ ДРР > цели" },
      { time: "04:00", bid: 100, drr: 19.0, position: 8, reason: "↓ ДРР > цели" },
      { time: "05:00", bid: 100, drr: 17.8, position: 8 },
      { time: "06:00", bid: 105, drr: 16.5, position: 9, reason: "↑ позиция упала" },
      { time: "07:00", bid: 110, drr: 15.9, position: 8, reason: "↑ позиция упала" },
      { time: "08:00", bid: 115, drr: 16.8, position: 7, reason: "↑ позиция упала" },
      { time: "09:00", bid: 120, drr: 17.2, position: 8, reason: "↑ позиция упала" },
      { time: "10:00", bid: 115, drr: 17.9, position: 7, reason: "↓ ДРР > цели" },
      { time: "11:00", bid: 115, drr: 17.4, position: 7 },
      { time: "12:00", bid: 120, drr: 17.2, position: 8 },
    ],
    103: [
      { time: "00:00", bid: 180, drr: 32.1, position: 3 },
      { time: "01:00", bid: 160, drr: 34.5, position: 2, reason: "↓ ДРР > цели" },
      { time: "02:00", bid: 145, drr: 36.2, position: 2, reason: "↓ ДРР > цели" },
      { time: "03:00", bid: 130, drr: 37.8, position: 2, reason: "↓ ДРР > цели" },
      { time: "04:00", bid: 120, drr: 39.1, position: 2, reason: "↓ ДРР > цели" },
      { time: "05:00", bid: 110, drr: 38.5, position: 3, reason: "↓ ДРР > цели" },
      { time: "06:00", bid: 110, drr: 37.2, position: 3 },
      { time: "07:00", bid: 115, drr: 36.9, position: 4, reason: "↑ позиция упала" },
      { time: "08:00", bid: 120, drr: 37.1, position: 3, reason: "↑ позиция упала" },
      { time: "09:00", bid: 115, drr: 38.0, position: 3, reason: "↓ ДРР > цели" },
      { time: "10:00", bid: 115, drr: 37.9, position: 3 },
      { time: "11:00", bid: 210, drr: 37.7, position: 2 },
      { time: "12:00", bid: 210, drr: 37.7, position: 2 },
    ],
  };
  return histories[campaignId] || [];
}

const DEFAULT_RULES: Record<number, BidRule> = {
  101: { campaignId: 101, enabled: true, targetDrr: 10, targetPosition: 5, minBid: 50, maxBid: 150 },
  102: { campaignId: 102, enabled: true, targetDrr: 15, targetPosition: 7, minBid: 80, maxBid: 200 },
  103: { campaignId: 103, enabled: false, targetDrr: 20, targetPosition: 5, minBid: 80, maxBid: 250 },
};

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function DrrBadge({ drr, target }: { drr: number; target: number }) {
  const diff = drr - target;
  if (diff > 5) return <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>ДРР {drr}% ▲</span>;
  if (diff > 0) return <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 600 }}>ДРР {drr}% ▲</span>;
  return <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>ДРР {drr}% ✓</span>;
}

function PositionBadge({ pos, target }: { pos: number; target: number }) {
  if (pos > target + 2) return <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>Поз. {pos} ▼</span>;
  if (pos > target) return <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 600 }}>Поз. {pos} ▼</span>;
  return <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>Поз. {pos} ✓</span>;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: ok ? "#34d399" : "#6b7280", marginRight: 6,
      boxShadow: ok ? "0 0 6px #34d399" : "none"
    }} />
  );
}

// ─── Кастомный тултип для графика ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as BidHistoryPoint;
  return (
    <div style={{
      background: "#1e2433", border: "1px solid #2d3548", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, color: "#e2e8f0"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#a78bfa" }}>{label}</div>
      <div>Ставка: <b style={{ color: "#fff" }}>{d.bid} ₽</b></div>
      <div>ДРР: <b style={{ color: d.drr > 15 ? "#f87171" : "#34d399" }}>{d.drr}%</b></div>
      <div>Позиция: <b style={{ color: "#fff" }}>#{d.position}</b></div>
      {d.reason && <div style={{ marginTop: 4, color: "#a78bfa", fontSize: 11 }}>{d.reason}</div>}
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function AutoBidsPage() {
  const [selectedId, setSelectedId] = useState<number>(101);
  const [rules, setRules] = useState<Record<number, BidRule>>(DEFAULT_RULES);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BidRule | null>(null);
  const [saved, setSaved] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(47);

  const campaign = DEMO_CAMPAIGNS.find(c => c.id === selectedId)!;
  const rule = rules[selectedId];
  const history = generateBidHistory(selectedId);

  useEffect(() => {
    const t = setInterval(() => setNextUpdate(n => n <= 0 ? 59 : n - 1), 1000);
    return () => clearInterval(t);
  }, []);

  function startEdit() {
    setDraft({ ...rule });
    setEditing(true);
  }

  function saveEdit() {
    if (!draft) return;
    setRules(r => ({ ...r, [selectedId]: draft }));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleEnabled() {
    setRules(r => ({ ...r, [selectedId]: { ...r[selectedId], enabled: !r[selectedId].enabled } }));
  }

  const totalChanges = Object.values(generateBidHistory(selectedId)).filter(h => h.reason).length;
  const lastBid = history[history.length - 1]?.bid || campaign.currentBid;

  return (
    <div style={{
      minHeight: "100vh", background: "#0f1320", color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif", padding: "0 0 80px 0"
    }}>

      {/* Заголовок */}
      <div style={{
        background: "linear-gradient(135deg, #1a1f35 0%, #12172a 100%)",
        borderBottom: "1px solid #1e2540", padding: "16px 16px 12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              🤖 Авто-ставки
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Wildberries · обновление через {nextUpdate} сек
            </div>
          </div>
          <div style={{
            background: "#1e2540", borderRadius: 8, padding: "6px 12px",
            fontSize: 12, color: "#a78bfa", fontWeight: 600
          }}>
            ДЕМО
          </div>
        </div>

        {/* Сводка */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginTop: 12
        }}>
          {[
            { label: "Активных правил", value: Object.values(rules).filter(r => r.enabled).length + " из 3" },
            { label: "Изменений сегодня", value: "18" },
            { label: "Экономия ДРР", value: "−4.2%" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "#141929", borderRadius: 8, padding: "8px 10px",
              border: "1px solid #1e2540"
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Список кампаний */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8 }}>
          КАМПАНИИ
        </div>
        {DEMO_CAMPAIGNS.map(c => {
          const r = rules[c.id];
          const active = c.id === selectedId;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                background: active ? "#1a2040" : "#141929",
                border: `1px solid ${active ? "#3b4fd9" : "#1e2540"}`,
                borderRadius: 10, padding: "10px 12px", marginBottom: 8,
                cursor: "pointer", transition: "all 0.15s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <StatusDot ok={r.enabled} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: active ? "#fff" : "#cbd5e1" }}>
                    {c.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <DrrBadge drr={c.drr} target={r.targetDrr} />
                  <PositionBadge pos={c.position} target={r.targetPosition} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Ставка: <b style={{ color: "#a78bfa" }}>{c.currentBid} ₽</b>
                </span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Цель ДРР: <b style={{ color: "#e2e8f0" }}>{r.targetDrr}%</b>
                </span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Топ-{r.targetPosition}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Детали выбранной кампании */}
      <div style={{ padding: "4px 16px 0" }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8 }}>
          НАСТРОЙКИ · {campaign.name.toUpperCase()}
        </div>

        {/* Карточка настроек */}
        <div style={{
          background: "#141929", border: "1px solid #1e2540",
          borderRadius: 12, padding: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Авто-управление</span>
              <div
                onClick={toggleEnabled}
                style={{
                  width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                  background: rule.enabled ? "#6d5ce7" : "#2d3548",
                  position: "relative", transition: "background 0.2s"
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: rule.enabled ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s"
                }} />
              </div>
            </div>
            {!editing ? (
              <button
                onClick={startEdit}
                style={{
                  background: "#1e2540", border: "1px solid #2d3548",
                  color: "#a78bfa", borderRadius: 7, padding: "5px 12px",
                  fontSize: 12, cursor: "pointer", fontWeight: 600
                }}
              >
                ✏️ Изменить
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "transparent", border: "1px solid #2d3548",
                    color: "#64748b", borderRadius: 7, padding: "5px 10px",
                    fontSize: 12, cursor: "pointer"
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "#6d5ce7", border: "none",
                    color: "#fff", borderRadius: 7, padding: "5px 12px",
                    fontSize: 12, cursor: "pointer", fontWeight: 600
                  }}
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>

          {saved && (
            <div style={{
              background: "#052e16", border: "1px solid #166534", borderRadius: 7,
              padding: "6px 10px", fontSize: 12, color: "#34d399", marginBottom: 10
            }}>
              ✓ Настройки сохранены
            </div>
          )}

          {/* Параметры */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Целевой ДРР, %", field: "targetDrr" as keyof BidRule, min: 1, max: 50 },
              { label: "Целевая позиция", field: "targetPosition" as keyof BidRule, min: 1, max: 20 },
              { label: "Мин. ставка, ₽", field: "minBid" as keyof BidRule, min: 10, max: 500 },
              { label: "Макс. ставка, ₽", field: "maxBid" as keyof BidRule, min: 50, max: 1000 },
            ].map(({ label, field, min, max }) => (
              <div key={field}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</div>
                {editing && draft ? (
                  <input
                    type="number"
                    min={min} max={max}
                    value={draft[field] as number}
                    onChange={e => setDraft(d => d ? { ...d, [field]: Number(e.target.value) } : d)}
                    style={{
                      width: "100%", background: "#1e2540", border: "1px solid #3b4fd9",
                      borderRadius: 7, padding: "6px 10px", color: "#fff",
                      fontSize: 14, fontWeight: 600, boxSizing: "border-box"
                    }}
                  />
                ) : (
                  <div style={{
                    background: "#1a1f35", borderRadius: 7, padding: "6px 10px",
                    fontSize: 14, fontWeight: 700, color: "#e2e8f0",
                    border: "1px solid #1e2540"
                  }}>
                    {rule[field]}
                    {field === "targetDrr" ? "%" : field === "targetPosition" ? " место" : " ₽"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Текущий статус */}
          <div style={{
            marginTop: 12, background: "#0f1320", borderRadius: 8,
            padding: "10px 12px", border: "1px solid #1e2540"
          }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              ТЕКУЩИЙ СТАТУС
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#a78bfa" }}>{lastBid} ₽</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>ставка</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 20, fontWeight: 800,
                  color: campaign.drr > rule.targetDrr ? "#f87171" : "#34d399"
                }}>
                  {campaign.drr}%
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>ДРР (цель {rule.targetDrr}%)</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 20, fontWeight: 800,
                  color: campaign.position > rule.targetPosition ? "#fbbf24" : "#34d399"
                }}>
                  #{campaign.position}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>позиция (цель топ-{rule.targetPosition})</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#64748b" }}>{totalChanges}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>изменений</div>
              </div>
            </div>
          </div>
        </div>

        {/* График ставок за день */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8 }}>
            ИСТОРИЯ СТАВОК ЗА СЕГОДНЯ
          </div>
          <div style={{
            background: "#141929", border: "1px solid #1e2540",
            borderRadius: 12, padding: "14px 8px 8px"
          }}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={rule.maxBid} stroke="#f87171" strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine y={rule.minBid} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.5} />
                <Line
                  type="monotone" dataKey="bid" stroke="#a78bfa" strokeWidth={2.5}
                  dot={(props: any) => {
                    const d = props.payload as BidHistoryPoint;
                    if (!d.reason) return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill="#a78bfa" />;
                    const color = d.reason.startsWith("↑") ? "#34d399" : "#f87171";
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill={color} stroke="#0f1320" strokeWidth={1.5} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
              <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                Повышение ставки
              </div>
              <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
                Снижение ставки
              </div>
            </div>
          </div>
        </div>

        {/* Лог изменений */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8 }}>
            ЛОГ ИЗМЕНЕНИЙ
          </div>
          <div style={{
            background: "#141929", border: "1px solid #1e2540",
            borderRadius: 12, overflow: "hidden"
          }}>
            {history.filter(h => h.reason).map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px",
                borderBottom: i < history.filter(x => x.reason).length - 1 ? "1px solid #1e2540" : "none"
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b", minWidth: 38 }}>{h.time}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: h.reason?.startsWith("↑") ? "#34d399" : "#f87171"
                  }}>
                    {h.reason}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                  <span style={{ color: "#a78bfa", fontWeight: 700 }}>{h.bid} ₽</span>
                  <span style={{ color: "#64748b" }}>ДРР {h.drr}%</span>
                  <span style={{ color: "#64748b" }}>#{h.position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
