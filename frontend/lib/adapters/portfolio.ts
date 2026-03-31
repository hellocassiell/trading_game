import type { AccountAssets, Position, TradeHistoryItem } from "../api";

function formatSignedCurrency(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}HK$ ${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCurrency(value: number) {
  return `HK$ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPrice(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatHktTime(isoTime?: string | null) {
  if (!isoTime) {
    return "--";
  }
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) {
    return isoTime;
  }
  const formatter = new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute} HKT`;
}

function toHkDateKey(isoTime?: string | null) {
  if (!isoTime) {
    return null;
  }
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatLabel(date: Date) {
  const formatter = new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date).replace(/\//g, "/");
}

export function buildProfileAssetTrend(
  totalAssets: number,
  history: TradeHistoryItem[]
) {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 4; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }

  const labels = dates.map((date) => formatLabel(date));
  const dateKeys = dates.map((date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Hong_Kong",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  );

  const dailyImpact = new Map<string, number>();
  for (const item of history) {
    const key = toHkDateKey(item.createdAt);
    if (!key) {
      continue;
    }
    const cashFlow = Number(item.estimatedNetCashFlow ?? 0);
    if (!Number.isFinite(cashFlow)) {
      continue;
    }
    dailyImpact.set(key, (dailyImpact.get(key) ?? 0) + cashFlow);
  }

  const values = new Array<number>(5).fill(0);
  values[4] = Number.isFinite(totalAssets) ? totalAssets : 0;
  for (let index = 4; index > 0; index -= 1) {
    const dayImpact = dailyImpact.get(dateKeys[index]) ?? 0;
    values[index - 1] = Math.max(0, values[index] - dayImpact);
  }

  return { labels, values };
}

export function mapAccountAssetsToProfileSummary(
  data: AccountAssets,
  trend?: { labels: string[]; values: number[] }
) {
  const fallbackTrend = buildProfileAssetTrend(data.totalAssets, []);
  return {
    nickname: data.nickname,
    avatar: data.avatar,
    rank: data.rank,
    rankDelta: data.rankDelta,
    dailyTradesRemaining: data.dailyTradesRemaining,
    weeklyTradesRequired: data.weeklyTradesRequired,
    weeklyTradesRemaining: data.weeklyTradesRemaining,
    initialCapital: formatCurrency(data.initialCapital),
    bonusAmount: formatCurrency(data.bonusAmount),
    portfolioValue: formatCurrency(data.securitiesMarketValue),
    availableCash: formatCurrency(data.cashAvailable),
    totalAssets: formatCurrency(data.totalAssets),
    updatedAt: formatHktTime(data.updatedAt),
    trendLabels: trend?.labels ?? fallbackTrend.labels,
    trendValues: trend?.values ?? fallbackTrend.values,
  };
}

export function mapPositionsToCards(positions: Position[]) {
  return positions.map((item) => ({
    symbol: item.stockCode,
    name: item.stockName,
    quantity: item.quantity.toLocaleString("en-US"),
    available: item.tradableQuantity.toLocaleString("en-US"),
    averagePrice: formatPrice(item.averagePrice),
    currentPrice: formatPrice(item.currentPrice),
    pnl: formatSignedCurrency(item.pnlAmount),
    pct: formatPercent(item.pnlPercent),
    positive: item.pnlAmount >= 0,
    referenceMarketValue: formatCurrency(item.referenceMarketValue),
  }));
}
