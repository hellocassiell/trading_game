import { placeTradeOrder, tradingApiClient } from "../api/trade";
import { byLanguage, getPreferredLanguage } from "../locale";
import type {
  TradeOrderDraft,
  TradeSubmitResult,
  TradeSearchPayload,
  ViewStatus,
} from "../api/types";

export type TradeProductViewModel = {
  symbol: string;
  company: string;
  sub: string;
  price: string;
  change: string;
  holdingValue?: string;
  cash?: string;
  remainingTrades?: string;
  cashBalance?: string;
  lotSize?: string;
  defaultPrice?: string;
  defaultQuantity?: string;
  settlementTotal?: string;
  platformLink?: string;
  status: ViewStatus;
  quoteUpdatedAt: string;
};

export type TradeSearchItem = {
  symbol: string;
  name: string;
  badge?: string;
};

function displayStockCode(stockCode: string) {
  // 港股代码应该保持5位数字，不去掉前导零
  const normalized = stockCode.trim().toUpperCase().replace(/\.HK$/, "");
  return normalized;
}

function normalizeSearchPayload(payload: TradeSearchPayload): TradeSearchItem[] {
  return (payload.items ?? []).map((item) => ({
    symbol: displayStockCode(item.stockCode),
    name: item.stockName,
  }));
}

function formatNumber(value: number, digits = 3) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatSigned(value: number, digits = 3) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatHktTime(isoTime?: string) {
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

export async function getTradeProductViewModel(symbol: string): Promise<TradeProductViewModel> {
  const code = displayStockCode(symbol);

  try {
    const [quote, account, positions] = await Promise.all([
      tradingApiClient.getTradeQuote(code),
      tradingApiClient.getAccountAssets(),
      tradingApiClient.getPositions(),
    ]);

    const matchedPosition = positions.find(
      (item) => displayStockCode(item.stockCode) === displayStockCode(quote.stockCode)
    );

    const grossAmount = Number(quote.currentPrice ?? 0) * Number(quote.lotSize ?? 0);
    const feeAmount = Math.max(1, grossAmount * 0.00075);

    return {
      symbol: displayStockCode(quote.stockCode),
      company: quote.stockName,
      sub: quote.currency,
      price: formatNumber(quote.currentPrice, 3),
      change: `${formatSigned(quote.changeAmount, 3)} (${formatSigned(quote.changePercent, 2)}%)`,
      holdingValue: matchedPosition
        ? `HK$ ${formatNumber(matchedPosition.referenceMarketValue, 2)}`
        : undefined,
      cash: `HK$ ${formatNumber(account.cashAvailable, 2)}`,
      remainingTrades: String(account.dailyTradesRemaining ?? 0),
      cashBalance: `${formatNumber(account.cashAvailable, 2)}`,
      lotSize: String(quote.lotSize ?? 100),
      defaultPrice: formatNumber(quote.currentPrice, 3),
      defaultQuantity: String(quote.lotSize ?? 100),
      settlementTotal: `HK$ ${formatNumber(grossAmount + feeAmount, 2)}`,
      platformLink: "https://www.aastocks.com/tc/stocks/market/index/hk-index-con.aspx",
      status: "success",
      quoteUpdatedAt: formatHktTime(quote.updatedAt),
    };
  } catch {
    return {
      symbol: code,
      company: code,
      sub: "HKD",
      price: "0.000",
      change: "+0.000 (0.00%)",
      remainingTrades: "0",
      cash: "HK$ 0.00",
      cashBalance: "0.00",
      lotSize: "100",
      defaultPrice: "0.000",
      defaultQuantity: "100",
      settlementTotal: "HK$ 0.00",
      platformLink: "https://www.aastocks.com/tc/stocks/market/index/hk-index-con.aspx",
      status: "error",
      quoteUpdatedAt: "--",
    };
  }
}

export async function getTradeSearchItems(keyword = ""): Promise<TradeSearchItem[]> {
  try {
    const payload = await tradingApiClient.searchTradeTargets(keyword);
    const normalized = normalizeSearchPayload(payload);
    if (keyword.trim()) {
      return normalized;
    }

    const language = getPreferredLanguage();
    const copy = byLanguage(language, {
      "zh-Hant": { badge: "熱門" },
      "zh-Hans": { badge: "热门" },
      en: { badge: "Hot" },
    });

    return normalized.map((item) => ({ ...item, badge: copy.badge }));
  } catch {
    return [];
  }
}

export async function submitTradeOrder(
  input: TradeOrderDraft
): Promise<TradeSubmitResult> {
  return placeTradeOrder(input);
}
