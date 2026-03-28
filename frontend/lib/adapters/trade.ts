import {
  assistantResults,
  getTradeProduct,
  recentSearches,
} from "../mock-data";
import { placeTradeOrder } from "../api/trade";
import type {
  TradeOrderDraft,
  TradeSubmitResult,
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

export function getTradeProductViewModel(symbol: string): TradeProductViewModel {
  return {
    ...getTradeProduct(symbol),
    status: "success",
    quoteUpdatedAt: "2021/04/21 11:00 HKT",
  };
}

export function getTradeSearchItems(): TradeSearchItem[] {
  const recentItems = recentSearches.map((item) => ({
    symbol: item.symbol,
    name: item.name,
    badge: "最近搜索",
  }));
  const assistantItems = assistantResults.map((item) => ({
    symbol: item.code,
    name: item.symbol,
    badge: "热门",
  }));

  return Array.from(
    [...recentItems, ...assistantItems].reduce<Map<string, TradeSearchItem>>(
      (map, item) => {
        if (!map.has(item.symbol)) {
          map.set(item.symbol, item);
        }
        return map;
      },
      new Map()
    ).values()
  );
}

export async function submitTradeOrder(
  input: TradeOrderDraft
): Promise<TradeSubmitResult> {
  return placeTradeOrder(input);
}
