import { useMemo, useState } from "react";
import { formatCurrency, formatInteger, formatPercent } from "@/components/metricUtils";
import type { MarketplaceId } from "@/data/marketplaceAnalytics";

type AnalyticsTab = "positions" | "revenue";
type PositionPeriod = "today" | "yesterday" | "dayBeforeYesterday" | "week";

type PositionKeywordRow = {
  keyword: string;
  bid: number;
  positionsByDay: [number, number, number, number, number, number, number];
};

type AdRevenueRow = {
  name: string;
  orderedQty: number;
  orderedAmount: number;
  soldQty: number;
  soldAmount: number;
  returnsQty: number;
  returnsAmount: number;
  buyoutPct: number;
  adRevenue: number;
};

const POSITION_WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const POSITION_DATA: Record<MarketplaceId, PositionKeywordRow[]> = {
  wb: [
    {
      keyword: "кроссовки женские",
      bid: 220,
      positionsByDay: [8, 6, 5, 4, 3, 3, 3]
    },
    {
      keyword: "кроссовки на платформе",
      bid: 180,
      positionsByDay: [10, 11, 12, 13, 12, 12, 12]
    },
    {
      keyword: "белые кроссовки",
      bid: 195,
      positionsByDay: [5, 5, 6, 7, 8, 7, 7]
    },
    {
      keyword: "кроссовки nike женские",
      bid: 150,
      positionsByDay: [20, 21, 22, 23, 24, 24, 24]
    },
    {
      keyword: "платья летние",
      bid: 210,
      positionsByDay: [9, 8, 7, 6, 5, 5, 5]
    }
  ],
  ozon: [
    {
      keyword: "рюкзак туристический",
      bid: 180,
      positionsByDay: [12, 11, 10, 9, 8, 8, 8]
    },
    {
      keyword: "термокружка 450мл",
      bid: 160,
      positionsByDay: [14, 15, 15, 16, 15, 15, 15]
    }
  ]
};

const AD_REVENUE_DATA: Record<MarketplaceId, AdRevenueRow[]> = {
  wb: [
    {
      name: "Кроссовки женские",
      orderedQty: 441,
      orderedAmount: 1_985_000,
      soldQty: 374,
      soldAmount: 1_683_000,
      returnsQty: 67,
      returnsAmount: 302_000,
      buyoutPct: 84.8,
      adRevenue: 1_683_000
    },
    {
      name: "Платья летние",
      orderedQty: 198,
      orderedAmount: 693_000,
      soldQty: 158,
      soldAmount: 553_000,
      returnsQty: 40,
      returnsAmount: 140_000,
      buyoutPct: 79.8,
      adRevenue: 553_000
    },
    {
      name: "Джинсы slim fit",
      orderedQty: 31,
      orderedAmount: 186_000,
      soldQty: 21,
      soldAmount: 126_000,
      returnsQty: 10,
      returnsAmount: 60_000,
      buyoutPct: 67.7,
      adRevenue: 126_000
    }
  ],
  ozon: [
    {
      name: "Рюкзак туристический",
      orderedQty: 9,
      orderedAmount: 47_700,
      soldQty: 8,
      soldAmount: 42_400,
      returnsQty: 1,
      returnsAmount: 5_300,
      buyoutPct: 88.9,
      adRevenue: 42_400
    },
    {
      name: "Термокружка 450мл",
      orderedQty: 18,
      orderedAmount: 43_200,
      soldQty: 15,
      soldAmount: 36_000,
      returnsQty: 3,
      returnsAmount: 7_200,
      buyoutPct: 83.3,
      adRevenue: 36_000
    },
    {
      name: "Куртка зимняя XL",
      orderedQty: 52,
      orderedAmount: 104_000,
      soldQty: 46,
      soldAmount: 92_000,
      returnsQty: 6,
      returnsAmount: 12_000,
      buyoutPct: 88.5,
      adRevenue: 92_000
    }
  ]
};

export function QueriesPage() {
  const [marketplace, setMarketplace] = useState<MarketplaceId>("ozon");
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("positions");
  const [period, setPeriod] = useState<PositionPeriod>("today");
  const [searchText, setSearchText] = useState("");

  const normalizedSearch = searchText.trim().toLowerCase();
  const positionRows = useMemo(
    () => POSITION_DATA[marketplace].filter((row) => row.keyword.toLowerCase().includes(normalizedSearch)),
    [marketplace, normalizedSearch]
  );
  const adRevenueRows = useMemo(
    () => AD_REVENUE_DATA[marketplace].filter((row) => row.name.toLowerCase().includes(normalizedSearch)),
    [marketplace, normalizedSearch]
  );

  return (
    <div className="space-y-4">
      <section className="app-card p-4">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setMarketplace("ozon")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              marketplace === "ozon"
                ? "border-sky-300/60 bg-sky-500/20 text-sky-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            🔵 Ozon
          </button>
          <button
            onClick={() => setMarketplace("wb")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              marketplace === "wb"
                ? "border-violet-300/60 bg-violet-500/20 text-violet-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            🟣 WB
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab("positions")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              activeTab === "positions"
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            📍 Позиции
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              activeTab === "revenue"
                ? "border-amber-300/60 bg-amber-500/20 text-amber-200"
                : "border-slate-500/30 text-slate-300"
            }`}
          >
            💰 Выручка
          </button>
        </div>

        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder={activeTab === "positions" ? "Поиск ключевого слова..." : "Поиск товара..."}
          className="w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
        />
      </section>

      {activeTab === "positions" && (
        <section className="app-card p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <PeriodButton label="Сегодня" active={period === "today"} onClick={() => setPeriod("today")} />
            <PeriodButton label="Вчера" active={period === "yesterday"} onClick={() => setPeriod("yesterday")} />
            <PeriodButton label="Позавчера" active={period === "dayBeforeYesterday"} onClick={() => setPeriod("dayBeforeYesterday")} />
            <PeriodButton label="7 дней" active={period === "week"} onClick={() => setPeriod("week")} />
          </div>

          <div className="overflow-x-auto">
            <table className={`text-xs ${period === "week" ? "min-w-[980px]" : "min-w-[620px]"}`}>
              <thead className="bg-slate-500/10 text-slate-300">
                {period === "week" ? (
                  <tr>
                    <th className="px-2 py-2 text-left">Ключевое слово</th>
                    {POSITION_WEEK_LABELS.map((label) => (
                      <th key={label} className="px-2 py-2 text-right">
                        {label}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-right">Ставка</th>
                    <th className="px-2 py-2 text-right">Изменение vs предыдущий день</th>
                    <th className="px-2 py-2 text-left">Тренд</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-2 py-2 text-left">Ключевое слово</th>
                    <th className="px-2 py-2 text-right">{positionColumnTitle(period)}</th>
                    <th className="px-2 py-2 text-right">Ставка</th>
                    <th className="px-2 py-2 text-right">Изменение vs предыдущий день</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {positionRows.map((row) => {
                  const selectedIndex = selectedPeriodIndex(period);
                  const currentPosition = row.positionsByDay[selectedIndex];
                  const previousPosition = row.positionsByDay[selectedIndex - 1];
                  return (
                    <tr key={row.keyword} className="border-t border-slate-500/20">
                      <td className="px-2 py-2 text-slate-100">{row.keyword}</td>
                      {period === "week" ? (
                        <>
                          {row.positionsByDay.map((value, index) => (
                            <td key={`${row.keyword}-${index}`} className="px-2 py-2 text-right text-slate-200">
                              {value}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.bid)}</td>
                          <td className="px-2 py-2 text-right">
                            <PositionChange current={row.positionsByDay[6]} previous={row.positionsByDay[5]} />
                          </td>
                          <td className="px-2 py-2">
                            <PositionSparkline values={row.positionsByDay} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-2 text-right text-slate-200">{currentPosition}</td>
                          <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.bid)}</td>
                          <td className="px-2 py-2 text-right">
                            <PositionChange current={currentPosition} previous={previousPosition} />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {!positionRows.length && (
                  <tr>
                    <td colSpan={period === "week" ? 11 : 4} className="px-2 py-8 text-center text-slate-400">
                      Нет данных по выбранному фильтру
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "revenue" && (
        <section className="app-card overflow-x-auto">
          <table className="min-w-[1080px] text-xs">
            <thead className="bg-slate-500/10 text-slate-300">
              <tr>
                <th className="px-2 py-2 text-left">Товар</th>
                <th className="px-2 py-2 text-left">Заказано с рекламы</th>
                <th className="px-2 py-2 text-left">Продано с рекламы (выкуп)</th>
                <th className="px-2 py-2 text-left">Возвраты</th>
                <th className="px-2 py-2 text-left">% выкупа</th>
                <th className="px-2 py-2 text-left">Выручка с рекламы</th>
              </tr>
            </thead>
            <tbody>
              {adRevenueRows.map((row) => {
                const buyoutMeta = resolveBuyoutMeta(row.buyoutPct);
                return (
                  <tr key={row.name} className="border-t border-slate-500/20 align-top">
                    <td className="px-2 py-2 text-slate-100">{row.name}</td>
                    <td className="px-2 py-2 text-slate-200">
                      <MetricWithHint
                        value={`${formatInteger(row.orderedQty)} шт | ${formatCurrency(row.orderedAmount)}`}
                        hint="(только рекламные заказы)"
                      />
                    </td>
                    <td className="px-2 py-2 text-slate-200">
                      <MetricWithHint
                        value={`${formatInteger(row.soldQty)} шт | ${formatCurrency(row.soldAmount)}`}
                        hint="(только рекламные заказы)"
                      />
                    </td>
                    <td className="px-2 py-2 text-slate-200">
                      <div className="font-semibold">
                        {formatInteger(row.returnsQty)} шт | {formatCurrency(row.returnsAmount)}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`font-semibold ${buyoutMeta.className}`} title={buyoutMeta.tooltip}>
                        {formatPercent(row.buyoutPct, 1)} {buyoutMeta.emoji}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-200">
                      <MetricWithHint value={formatCurrency(row.adRevenue)} hint="(только рекламные заказы)" />
                    </td>
                  </tr>
                );
              })}
              {!adRevenueRows.length && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-slate-400">
                    Нет данных по выбранному фильтру
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function PeriodButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
        active ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-200" : "border-slate-500/30 text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function selectedPeriodIndex(period: PositionPeriod) {
  if (period === "today") return 6;
  if (period === "yesterday") return 5;
  if (period === "dayBeforeYesterday") return 4;
  return 6;
}

function positionColumnTitle(period: Exclude<PositionPeriod, "week">) {
  if (period === "today") return "Позиция сейчас";
  if (period === "yesterday") return "Позиция вчера";
  return "Позиция позавчера";
}

function PositionChange({ current, previous }: { current: number; previous?: number }) {
  if (typeof previous !== "number") {
    return <span className="font-semibold text-slate-400">→</span>;
  }

  const delta = previous - current;
  if (delta > 0) {
    return <span className="font-semibold text-emerald-300">↑{delta}</span>;
  }
  if (delta < 0) {
    return <span className="font-semibold text-rose-300">↓{Math.abs(delta)}</span>;
  }
  return <span className="font-semibold text-slate-400">→</span>;
}

function PositionSparkline({ values }: { values: number[] }) {
  const width = 90;
  const height = 28;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const points = values.map((value, index) => {
    const x = pad + (innerWidth * index) / Math.max(values.length - 1, 1);
    const y = pad + ((value - min) / range) * innerHeight;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Тренд позиций за 7 дней">
      <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={points.join(" ")} />
      {points.map((point, index) => {
        const [cx, cy] = point.split(",");
        return <circle key={index} cx={cx} cy={cy} r={1.6} fill="#93c5fd" />;
      })}
    </svg>
  );
}

function MetricWithHint({ value, hint }: { value: string; hint: string }) {
  return (
    <div>
      <div className="font-semibold">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>
    </div>
  );
}

function resolveBuyoutMeta(value: number) {
  if (value > 80) {
    return {
      emoji: "🟢",
      className: "text-emerald-300",
      tooltip: "Хороший выкуп"
    };
  }
  if (value >= 60) {
    return {
      emoji: "🟡",
      className: "text-amber-300",
      tooltip: "Средний выкуп — проверьте описание/размерную сетку"
    };
  }
  return {
    emoji: "🔴",
    className: "text-rose-300",
    tooltip: "Низкий выкуп — серьёзная проблема с карточкой"
  };
}
