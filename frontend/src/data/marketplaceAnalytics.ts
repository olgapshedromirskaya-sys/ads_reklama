export type MarketplaceId = "ozon" | "wb";

export type TodayMetrics = {
  revenue: number;
  revenuePlan: number;
  orders: number;
  ordersPlan: number;
  adSpend: number;
  adSpendPlan: number;
  conversion: number;
  conversionPlan: number;
};

export type FunnelRawMetrics = {
  impressions: number;
  clicks: number;
  spend: number;
  cartAdds: number;
  orders: number;
  revenue: number;
};

export type FunnelMetrics = FunnelRawMetrics & {
  ctr: number;
  cpc: number;
  cartCr: number;
  cr: number;
  drr: number;
  romi: number;
};

export type ArticleMetrics = {
  name: string;
  sku: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cartAdds?: number;
  orders: number;
  cr?: number;
  revenue?: number;
  spend: number;
  drr: number;
  cpo: number;
};

export type KeywordRawMetrics = {
  keyword: string;
  impressions: number;
  clicks: number;
  cartAdds: number;
  orders: number;
  spend: number;
  revenue: number;
};

export type KeywordMetrics = KeywordRawMetrics & {
  ctr: number;
  cpc: number;
  cartCr: number;
  cr: number;
  drr: number;
};

export type DiagnosticIssue = {
  id: string;
  title: string;
  cause: string;
  recommendation: string;
};

export type MarketplaceDashboardData = {
  id: MarketplaceId;
  title: string;
  badge: string;
  accentHex: string;
  today: TodayMetrics;
  funnelRaw: FunnelRawMetrics;
  articles: ArticleMetrics[];
  keywords: KeywordRawMetrics[];
};

function pct(value: number, base: number) {
  if (!base) {
    return 0;
  }
  return (value / base) * 100;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function computeFunnelMetrics(raw: FunnelRawMetrics): FunnelMetrics {
  const ctr = pct(raw.clicks, raw.impressions);
  const cpc = raw.clicks > 0 ? raw.spend / raw.clicks : 0;
  const cartCr = pct(raw.cartAdds, raw.clicks);
  const cr = pct(raw.orders, raw.clicks);
  const drr = raw.revenue > 0 ? pct(raw.spend, raw.revenue) : raw.spend > 0 ? 999 : 0;
  const romi = raw.spend > 0 ? ((raw.revenue - raw.spend) / raw.spend) * 100 : 0;
  return {
    ...raw,
    ctr: round(ctr, 2),
    cpc: round(cpc, 2),
    cartCr: round(cartCr, 2),
    cr: round(cr, 2),
    drr: round(drr, 2),
    romi: round(romi, 0)
  };
}

export function computeKeywordMetrics(row: KeywordRawMetrics): KeywordMetrics {
  const ctr = pct(row.clicks, row.impressions);
  const cpc = row.clicks > 0 ? row.spend / row.clicks : 0;
  const cartCr = pct(row.cartAdds, row.clicks);
  const cr = pct(row.orders, row.clicks);
  const drr = row.revenue > 0 ? pct(row.spend, row.revenue) : row.spend > 0 ? 999 : 0;
  return {
    ...row,
    ctr: round(ctr, 2),
    cpc: round(cpc, 2),
    cartCr: round(cartCr, 2),
    cr: round(cr, 2),
    drr: round(drr, 2)
  };
}

export function detectDiagnosticIssues(dashboard: MarketplaceDashboardData): DiagnosticIssue[] {
  const keywordMetrics = dashboard.keywords.map(computeKeywordMetrics);
  const issues: DiagnosticIssue[] = [];

  const lowCtr = keywordMetrics.find((row) => row.impressions > 1_000 && row.ctr < 1);
  if (lowCtr) {
    issues.push({
      id: "low-ctr",
      title: "❌ Много показов, мало кликов",
      cause: "Причина: фото/цена/рейтинг не цепляют",
      recommendation: "Рекомендация: Обновите главное фото, проверьте цену конкурентов"
    });
  }

  const lowCr = keywordMetrics.find((row) => row.clicks > 100 && row.cr < 3);
  if (lowCr) {
    issues.push({
      id: "low-cr",
      title: "❌ Много кликов, мало заказов",
      cause: "Причина: карточка не убеждает",
      recommendation: "Рекомендация: Улучшите описание, добавьте отзывы"
    });
  }

  const drrCandidatesWithOrders = keywordMetrics.filter((row) => row.drr > 35 && row.orders > 0);
  const drrCandidates = drrCandidatesWithOrders.length > 0 ? drrCandidatesWithOrders : keywordMetrics.filter((row) => row.drr > 35);
  const unprofitable = drrCandidates.sort((a, b) => b.drr - a.drr)[0];
  if (unprofitable) {
    issues.push({
      id: "high-drr",
      title: `❌ ДРР ${unprofitable.drr.toFixed(1)}% — кампания убыточна`,
      cause: "Причина: высокая ставка или низкая маржа",
      recommendation: "Рекомендация: Снизьте ставки или поставьте на паузу"
    });
  }

  const zeroSalesKeywords = keywordMetrics.filter((row) => row.clicks > 30 && row.orders === 0);
  if (zeroSalesKeywords.length > 0) {
    const topWastedKeyword = [...zeroSalesKeywords].sort((a, b) => b.spend - a.spend)[0];
    const wasted = zeroSalesKeywords.reduce((sum, row) => sum + row.spend, 0);
    issues.push({
      id: "zero-sales-keyword",
      title: `❌ Ключ '${topWastedKeyword.keyword}': ${Math.round(topWastedKeyword.clicks)} кликов, 0 заказов, потрачено ${Math.round(
        topWastedKeyword.spend
      ).toLocaleString("ru-RU")}₽`,
      cause: "Причина: нерелевантный спрос по ключу",
      recommendation: "Рекомендация: Добавить в минус-слова"
    });
    issues.push({
      id: "zero-sales-keys",
      title: `❌ ${zeroSalesKeywords.length} ключей с 0 продажами сливают ${Math.round(wasted).toLocaleString("ru-RU")}₽/день`,
      cause: "Причина: запросы не приводят к конверсии",
      recommendation: "Рекомендация: Добавить в минус-слова"
    });
  }

  const expensiveNoOrders = keywordMetrics
    .filter((row) => row.orders === 0 && row.cpc >= 40)
    .sort((a, b) => b.cpc - a.cpc)[0];
  if (expensiveNoOrders) {
    issues.push({
      id: "expensive-cpc",
      title: `❌ CPC ${expensiveNoOrders.cpc.toFixed(0)}₽ — дорого, заказов нет`,
      cause: "Причина: ставка завышена для нерезультативного ключа",
      recommendation: "Рекомендация: Снизьте ставку"
    });
  }

  return issues;
}

export type KeywordRecommendation = {
  text: string;
  toneClass: string;
};

export function resolveKeywordRecommendation(metrics: KeywordMetrics): KeywordRecommendation {
  if (metrics.ctr < 0.5) {
    return { text: "⚫ Нерелевантный", toneClass: "text-slate-300" };
  }
  if (metrics.clicks > 30 && metrics.orders === 0) {
    return { text: "🔴 Отключить", toneClass: "text-rose-300" };
  }
  if (metrics.drr > 40) {
    return { text: "🔴 Снизить ставку", toneClass: "text-orange-300" };
  }
  if (metrics.cr < 3 && metrics.clicks > 50) {
    return { text: "🟡 Улучшить карточку", toneClass: "text-amber-300" };
  }
  if (metrics.drr < 15 && metrics.cr > 5 && metrics.orders > 5) {
    return { text: "🟢 Масштабировать", toneClass: "text-emerald-300" };
  }
  return { text: "🟡 Наблюдать", toneClass: "text-amber-300" };
}

export const MARKETPLACE_ANALYTICS: Record<MarketplaceId, MarketplaceDashboardData> = {
  wb: {
    id: "wb",
    title: "Wildberries",
    badge: "🟣 WB",
    accentHex: "#a855f7",
    today: {
      revenue: 340_000,
      revenuePlan: 600_000,
      orders: 287,
      ordersPlan: 550,
      adSpend: 28_500,
      adSpendPlan: 32_000,
      conversion: 3.2,
      conversionPlan: 4.5
    },
    funnelRaw: {
      impressions: 1_240_000,
      clicks: 38_440,
      spend: 730_360,
      cartAdds: 5_766,
      orders: 1_247,
      revenue: 8_713_195
    },
    articles: [
      {
        name: "Кроссовки женские",
        sku: "WB-201",
        impressions: 245_000,
        ctr: 3.6,
        clicks: 8_820,
        cpc: 19,
        cartAdds: 1_323,
        orders: 441,
        cr: 5.0,
        revenue: 1_985_000,
        spend: 163_170,
        drr: 8.2,
        cpo: 370
      },
      {
        name: "Платья летние",
        sku: "WB-334",
        impressions: 189_000,
        ctr: 3.0,
        clicks: 5_670,
        cpc: 21,
        orders: 198,
        cr: 3.5,
        revenue: 693_000,
        spend: 119_070,
        drr: 17.2,
        cpo: 601
      },
      {
        name: "Джинсы slim fit",
        sku: "WB-445",
        impressions: 156_000,
        ctr: 1.0,
        clicks: 1_560,
        cpc: 45,
        orders: 31,
        cr: 2.0,
        revenue: 186_000,
        spend: 70_200,
        drr: 37.7,
        cpo: 2_265
      }
    ],
    keywords: [
      {
        keyword: "кроссовки женские",
        impressions: 210_000,
        clicks: 7_560,
        cartAdds: 1_260,
        orders: 472,
        spend: 92_000,
        revenue: 1_180_000
      },
      {
        keyword: "кроссовки для бега",
        impressions: 144_000,
        clicks: 4_032,
        cartAdds: 600,
        orders: 201,
        spend: 54_800,
        revenue: 602_000
      },
      {
        keyword: "платья летние",
        impressions: 189_000,
        clicks: 5_670,
        cartAdds: 850,
        orders: 198,
        spend: 119_070,
        revenue: 693_000
      },
      {
        keyword: "джинсы slim fit",
        impressions: 156_000,
        clicks: 1_560,
        cartAdds: 65,
        orders: 31,
        spend: 70_200,
        revenue: 186_000
      },
      {
        keyword: "кроссовки мужские 46",
        impressions: 240_000,
        clicks: 80,
        cartAdds: 1,
        orders: 0,
        spend: 4_800,
        revenue: 0
      },
      {
        keyword: "тапочки домашние",
        impressions: 142_000,
        clicks: 890,
        cartAdds: 14,
        orders: 0,
        spend: 3_200,
        revenue: 0
      },
      {
        keyword: "сапоги зимние",
        impressions: 78_000,
        clicks: 450,
        cartAdds: 8,
        orders: 0,
        spend: 2_100,
        revenue: 0
      },
      {
        keyword: "босоножки детские",
        impressions: 25_500,
        clicks: 110,
        cartAdds: 2,
        orders: 0,
        spend: 600,
        revenue: 0
      },
      {
        keyword: "рабочие ботинки",
        impressions: 18_200,
        clicks: 95,
        cartAdds: 1,
        orders: 0,
        spend: 500,
        revenue: 0
      },
      {
        keyword: "туфли мужские классика",
        impressions: 22_400,
        clicks: 130,
        cartAdds: 1,
        orders: 0,
        spend: 600,
        revenue: 0
      },
      {
        keyword: "берцы армейские",
        impressions: 19_300,
        clicks: 120,
        cartAdds: 1,
        orders: 0,
        spend: 500,
        revenue: 0
      }
    ]
  },
  ozon: {
    id: "ozon",
    title: "Ozon",
    badge: "🔵 Ozon",
    accentHex: "#3b82f6",
    today: {
      revenue: 180_000,
      revenuePlan: 300_000,
      orders: 138,
      ordersPlan: 350,
      adSpend: 10_000,
      adSpendPlan: 12_000,
      conversion: 2.5,
      conversionPlan: 4.0
    },
    funnelRaw: {
      impressions: 847_000,
      clicks: 24_563,
      spend: 540_386,
      cartAdds: 2_698,
      orders: 614,
      revenue: 9_726_948
    },
    articles: [
      {
        name: "Рюкзак туристический",
        sku: "OZ-335",
        spend: 2_000,
        orders: 9,
        cpo: 227,
        drr: 16.4
      },
      {
        name: "Термокружка 450мл",
        sku: "OZ-248",
        spend: 3_000,
        orders: 18,
        cpo: 170,
        drr: 12.3
      },
      {
        name: "Куртка зимняя XL",
        sku: "OZ-111",
        spend: 5_000,
        orders: 52,
        cpo: 98,
        drr: 7.1
      }
    ],
    keywords: [
      {
        keyword: "рюкзак туристический",
        impressions: 120_000,
        clicks: 3_600,
        cartAdds: 540,
        orders: 220,
        spend: 24_000,
        revenue: 390_000
      },
      {
        keyword: "термокружка 450мл",
        impressions: 98_000,
        clicks: 2_744,
        cartAdds: 410,
        orders: 150,
        spend: 18_000,
        revenue: 219_000
      },
      {
        keyword: "куртка зимняя xl",
        impressions: 130_000,
        clicks: 3_250,
        cartAdds: 390,
        orders: 190,
        spend: 30_000,
        revenue: 423_000
      },
      {
        keyword: "джинсы slim fit",
        impressions: 60_000,
        clicks: 780,
        cartAdds: 45,
        orders: 16,
        spend: 18_000,
        revenue: 40_000
      },
      {
        keyword: "рюкзак мужской городской",
        impressions: 110_000,
        clicks: 900,
        cartAdds: 70,
        orders: 20,
        spend: 16_000,
        revenue: 55_000
      },
      {
        keyword: "термокружка дешево",
        impressions: 70_000,
        clicks: 410,
        cartAdds: 12,
        orders: 0,
        spend: 8_700,
        revenue: 0
      },
      {
        keyword: "куртка оптом",
        impressions: 52_000,
        clicks: 150,
        cartAdds: 4,
        orders: 0,
        spend: 5_200,
        revenue: 0
      }
    ]
  }
};

