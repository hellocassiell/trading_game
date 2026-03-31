import { tradingApiClient } from "../api";
import type { ViewStatus } from "../api/types";

export type AssistantSearchRow = {
  code: string;
  symbol: string;
};

export type AssistantSearchData = {
  status: ViewStatus;
  keyword: string;
  total: number;
  rows: AssistantSearchRow[];
};

function displayStockCode(stockCode: string) {
  const normalized = stockCode.trim().toUpperCase().replace(/\.HK$/, "");
  if (/^0\d{4}$/.test(normalized)) {
    return normalized.slice(1);
  }
  return normalized;
}

export function createInitialAssistantSearchData(keyword = ""): AssistantSearchData {
  return {
    status: "loading",
    keyword,
    total: 0,
    rows: [],
  };
}

export async function getAssistantSearchData(keyword: string): Promise<AssistantSearchData> {
  try {
    const payload = await tradingApiClient.searchTradeTargets(keyword);
    const rows = (payload.items ?? []).map((item) => ({
      code: displayStockCode(item.stockCode),
      symbol: item.stockName,
    }));
    return {
      status: rows.length ? "success" : "empty",
      keyword: payload.keyword ?? keyword,
      total: payload.total ?? rows.length,
      rows,
    };
  } catch {
    return {
      status: "error",
      keyword,
      total: 0,
      rows: [],
    };
  }
}
