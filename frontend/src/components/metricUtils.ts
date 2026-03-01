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
  if (ctr < 1) return "text-rose-600";
  if (ctr < 3) return "text-amber-600";
  if (ctr < 6) return "text-emerald-600";
  return "text-blue-600";
}

export function crColorClass(cr: number) {
  if (cr < 3) return "text-rose-600";
  if (cr < 8) return "text-amber-600";
  return "text-emerald-600";
}

export function drrColorClass(drr: number) {
  if (drr < 15) return "text-emerald-600";
  if (drr < 25) return "text-amber-600";
  if (drr < 35) return "text-orange-600";
  return "text-rose-600";
}

export function marketplaceLabel(marketplace?: "wb" | "ozon" | null) {
  if (marketplace === "wb") return "WB";
  if (marketplace === "ozon") return "Ozon";
  return "—";
}
