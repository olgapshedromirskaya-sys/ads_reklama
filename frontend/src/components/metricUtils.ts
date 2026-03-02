export function formatInteger(value: number) {
  return Math.round(value).toLocaleString("ru-RU");
}

export function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("ru-RU")}₽`;
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function ctrColorClass(ctr: number) {
  if (ctr < 1) return "text-rose-300";
  if (ctr < 3) return "text-amber-300";
  if (ctr < 6) return "text-emerald-300";
  return "text-sky-300";
}

export function crColorClass(cr: number) {
  if (cr < 3) return "text-rose-300";
  if (cr < 8) return "text-amber-300";
  return "text-emerald-300";
}

export function drrColorClass(drr: number) {
  if (drr < 15) return "text-emerald-300";
  if (drr < 25) return "text-amber-300";
  if (drr < 35) return "text-orange-300";
  return "text-rose-300";
}

export function romiColorClass(romi: number) {
  if (romi > 500) return "text-emerald-300";
  if (romi >= 200) return "text-amber-300";
  return "text-rose-300";
}

export function ctrBenchmarkLabel(ctr: number) {
  if (ctr < 1) return "🔴 Очень низкий — карточка не цепляет";
  if (ctr < 3) return "🟡 Слабовато";
  if (ctr < 6) return "🟢 Норм";
  return "🔵 Отлично";
}

export function crBenchmarkLabel(cr: number) {
  if (cr < 3) return "🔴 Плохо — проблема в карточке";
  if (cr < 8) return "🟡 Нормально";
  return "🟢 Сильная карточка";
}

export function drrBenchmarkLabel(drr: number) {
  if (drr < 15) return "🟢 Шик";
  if (drr < 25) return "🟡 Ок";
  if (drr < 35) return "🟠 На грани";
  return "🔴 Убыточно";
}

export function romiBenchmarkLabel(romi: number) {
  if (romi > 500) return "🟢 Отличный";
  if (romi >= 200) return "🟡 Хороший";
  return "🔴 Низкий";
}

export function marketplaceLabel(marketplace?: "wb" | "ozon" | null) {
  if (marketplace === "wb") return "WB";
  if (marketplace === "ozon") return "Ozon";
  return "—";
}
