import { useMemo, useState } from "react";
import {
  crColorClass,
  ctrColorClass,
  drrColorClass,
  formatCurrency,
  formatInteger,
  formatPercent
} from "@/components/metricUtils";
import {
  MARKETPLACE_ANALYTICS,
  type MarketplaceId,
  computeKeywordMetrics,
  resolveKeywordRecommendation
} from "@/data/marketplaceAnalytics";

export function QueriesPage() {
  const [marketplace, setMarketplace] = useState<MarketplaceId>("ozon");
  const [searchText, setSearchText] = useState("");

  const rows = useMemo(() => {
    return MARKETPLACE_ANALYTICS[marketplace].keywords
      .map(computeKeywordMetrics)
      .filter((row) => row.keyword.toLowerCase().includes(searchText.trim().toLowerCase()))
      .sort((a, b) => b.spend - a.spend);
  }, [marketplace, searchText]);

  const scalingCount = rows.filter((row) => resolveKeywordRecommendation(row).text.includes("Масштабировать")).length;
  const stopCount = rows.filter((row) => resolveKeywordRecommendation(row).text.includes("Отключить")).length;

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

        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Поиск ключевого слова..."
          className="w-full rounded-lg border border-slate-500/30 bg-slate-700/10 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="app-card p-3">
          <div className="text-xs text-slate-300">🟢 К масштабированию</div>
          <div className="mt-1 text-xl font-bold text-emerald-300">{formatInteger(scalingCount)}</div>
        </div>
        <div className="app-card p-3">
          <div className="text-xs text-slate-300">🔴 К отключению</div>
          <div className="mt-1 text-xl font-bold text-rose-300">{formatInteger(stopCount)}</div>
        </div>
      </section>

      <section className="app-card overflow-x-auto">
        <table className="min-w-[1120px] text-xs">
          <thead className="bg-slate-500/10 text-slate-300">
            <tr>
              <th className="px-2 py-2 text-left">Ключевое слово</th>
              <th className="px-2 py-2 text-right">Показы</th>
              <th className="px-2 py-2 text-right">CTR</th>
              <th className="px-2 py-2 text-right">Клики</th>
              <th className="px-2 py-2 text-right">CPC</th>
              <th className="px-2 py-2 text-right">В корзину</th>
              <th className="px-2 py-2 text-right">Заказы</th>
              <th className="px-2 py-2 text-right">CR</th>
              <th className="px-2 py-2 text-right">Расход</th>
              <th className="px-2 py-2 text-right">ДРР</th>
              <th className="px-2 py-2 text-left">Рекомендация</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const recommendation = resolveKeywordRecommendation(row);
              return (
                <tr key={row.keyword} className="border-t border-slate-500/20">
                  <td className="px-2 py-2 text-slate-100">{row.keyword}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.impressions)}</td>
                  <td className={`px-2 py-2 text-right font-semibold ${ctrColorClass(row.ctr)}`}>{formatPercent(row.ctr, 1)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.clicks)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.cpc)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.cartAdds)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatInteger(row.orders)}</td>
                  <td className={`px-2 py-2 text-right font-semibold ${crColorClass(row.cr)}`}>{formatPercent(row.cr, 1)}</td>
                  <td className="px-2 py-2 text-right text-slate-200">{formatCurrency(row.spend)}</td>
                  <td className={`px-2 py-2 text-right font-semibold ${drrColorClass(row.drr)}`}>{formatPercent(row.drr, 1)}</td>
                  <td className={`px-2 py-2 font-semibold ${recommendation.toneClass}`}>{recommendation.text}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={11} className="px-2 py-8 text-center text-slate-400">
                  Нет данных по выбранному фильтру
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
