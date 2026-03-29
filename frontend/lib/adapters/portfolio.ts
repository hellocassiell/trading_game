import type { AccountAssets, Position } from "../api";

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

export function mapAccountAssetsToProfileSummary(data: AccountAssets) {
  return {
    nickname: data.nickname,
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
    updatedAt: data.updatedAt,
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
