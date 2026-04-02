import {
  getApiBaseUrl,
  getAuthToken,
  getStoredUserId,
} from "./config";
import type {
  AccountAssets,
  ActiveOrder,
  BackendResult,
  Position,
  TradeOrderDraft,
  TradeHistoryItem,
  TradeCancelResult,
  TradeQuoteSnapshot,
  TradeQuoteStreamPayload,
  TradeOrderStatus,
  TradeSubmitResult,
  HomeOverviewPayload,
  StarTradersLeaderboardPayload,
  TopHoldingsLeaderboardPayload,
  TopLoserHoldingsLeaderboardPayload,
  TopTurnoverLeaderboardPayload,
  RankingsLeaderboardPayload,
  TradeSearchPayload,
} from "./types";
import { type AppLanguage, byLanguage, getPreferredLanguage } from "../locale";

type BackendTradeOrderRequest = {
  stockCode: string;
  direction: "BUY" | "SELL";
  orderType: "LIMIT" | "MARKET";
  price?: number;
  quantity: number;
};

function normalizeStockCodeForBackend(stockCode: string) {
  const raw = stockCode.trim().toUpperCase().replace(/\.HK$/, "");
  if (/^\d{4}$/.test(raw)) {
    return raw.padStart(5, "0");
  }
  return raw;
}

function toBackendPayload(input: TradeOrderDraft): BackendTradeOrderRequest {
  const price =
    input.orderType === "MARKET" ? undefined : Number(input.price.toFixed(3));

  return {
    stockCode: normalizeStockCodeForBackend(input.stockCode),
    direction: input.side,
    orderType: input.orderType,
    price,
    quantity: input.quantity,
  };
}

async function fetchBackendResult<T>(
  path: string,
  init?: RequestInit,
  userId?: string,
  languageOverride?: AppLanguage
): Promise<T> {
  const authToken = getAuthToken();
  const language = languageOverride || getPreferredLanguage();
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);
  url.searchParams.set("lang", language);
  const resolvedUserId = userId ?? getStoredUserId();
  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Lang": language,
      ...(resolvedUserId ? { "X-User-Id": resolvedUserId } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const result = (await response.json()) as BackendResult<T>;
  const errorFallback = byLanguage(language, {
    "zh-Hant": "請求失敗，請稍後重試",
    "zh-Hans": "请求失败，请稍后重试",
    en: "Request failed. Please try again later.",
  });

  if (!response.ok || result.code !== 200) {
    throw new Error(result.msg || errorFallback);
  }

  return result.data;
}

export async function placeTradeOrder(
  input: TradeOrderDraft
): Promise<TradeSubmitResult> {
  const language = getPreferredLanguage();
  try {
    const result = await fetchBackendResult<{ orderId: string; message: string }>(
      "/api/v1/trade/orders",
      {
        method: "POST",
        body: JSON.stringify(toBackendPayload(input)),
      },
      input.userId
    );

    return {
      ok: true,
      orderId: result.orderId,
      message: result.message || "success",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : byLanguage(language, {
              "zh-Hant": "網絡異常，暫時無法提交交易",
              "zh-Hans": "网络异常，暂时无法提交交易",
              en: "Network error. Unable to submit order now.",
            }),
    };
  }
}

export const tradingApiClient = {
  placeTradeOrder,
  async getHomeOverview(userId?: string, language?: AppLanguage): Promise<HomeOverviewPayload> {
    return fetchBackendResult<HomeOverviewPayload>("/api/v1/home/overview", undefined, userId, language);
  },
  async getStarTraders(userId?: string, language?: AppLanguage): Promise<StarTradersLeaderboardPayload> {
    return fetchBackendResult<StarTradersLeaderboardPayload>("/api/v1/leaderboard/star-traders", undefined, userId, language);
  },
  async getTopHoldingsLeaderboard(language?: AppLanguage): Promise<TopHoldingsLeaderboardPayload> {
    return fetchBackendResult<TopHoldingsLeaderboardPayload>("/api/v1/leaderboard/top-holdings", undefined, undefined, language);
  },
  async getTopTurnoverLeaderboard(language?: AppLanguage): Promise<TopTurnoverLeaderboardPayload> {
    return fetchBackendResult<TopTurnoverLeaderboardPayload>("/api/v1/leaderboard/top-turnover", undefined, undefined, language);
  },
  async getTopLoserHoldingsLeaderboard(): Promise<TopLoserHoldingsLeaderboardPayload> {
    return fetchBackendResult<TopLoserHoldingsLeaderboardPayload>("/api/v1/leaderboard/top-loser-holdings");
  },
  async getRankingsLeaderboard(page = 1, pageSize = 20, userId?: string): Promise<RankingsLeaderboardPayload> {
    return fetchBackendResult<RankingsLeaderboardPayload>(
      `/api/v1/leaderboard/rankings?page=${page}&pageSize=${pageSize}`,
      undefined,
      userId
    );
  },
  async cancelOrder(orderId: string, userId?: string): Promise<TradeCancelResult> {
    const language = getPreferredLanguage();
    try {
      const data = await fetchBackendResult<{
        orderId: string;
        status: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED";
        releasedCash: number;
        releasedQuantity: number;
      }>(`/api/v1/trade/orders/${orderId}/cancel`, { method: "POST" }, userId);

      return {
        ok: true,
        orderId: data.orderId,
        status: data.status,
        releasedCash: data.releasedCash ?? 0,
        releasedQuantity: data.releasedQuantity ?? 0,
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : byLanguage(language, {
                "zh-Hant": "網絡異常，暫時無法取消訂單",
                "zh-Hans": "网络异常，暂时无法取消订单",
                en: "Network error. Unable to cancel order now.",
              }),
      };
    }
  },
  async amendOrder(
    orderId: string,
    price: number,
    quantity: number,
    userId?: string
  ): Promise<
    | { ok: true; orderId: string; status: TradeOrderStatus }
    | { ok: false; message: string }
  > {
    const language = getPreferredLanguage();
    try {
      const data = await fetchBackendResult<{
        orderId: string;
        status: TradeOrderStatus;
      }>(
        `/api/v1/trade/orders/${orderId}/amend`,
        {
          method: "POST",
          body: JSON.stringify({ price, quantity }),
        },
        userId
      );

      return {
        ok: true,
        orderId: data.orderId,
        status: data.status,
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : byLanguage(language, {
                "zh-Hant": "網絡異常，暫時無法修改訂單",
                "zh-Hans": "网络异常，暂时无法修改订单",
                en: "Network error. Unable to amend order now.",
              }),
      };
    }
  },
  async getAccountAssets(userId?: string): Promise<AccountAssets> {
    return fetchBackendResult<AccountAssets>("/api/v1/account/profile", undefined, userId);
  },
  async getPositions(userId?: string): Promise<Position[]> {
    const data = await fetchBackendResult<{
      currency: string;
      updatedAt: string;
      items: Position[];
    }>("/api/v1/account/positions", undefined, userId);

    return data.items;
  },
  async getActiveOrders(
    status: "ALL" | "PENDING" | "FILLED" = "ALL",
    userId?: string
  ): Promise<ActiveOrder[]> {
    const data = await fetchBackendResult<{
      total: number;
      updatedAt: string;
      items: ActiveOrder[];
    }>(`/api/v1/trade/orders/active?status=${status}`, undefined, userId);

    return data.items;
  },
  async getTradeHistory(userId?: string): Promise<TradeHistoryItem[]> {
    const data = await fetchBackendResult<{
      page: number;
      pageSize: number;
      total: number;
      items: TradeHistoryItem[];
    }>("/api/v1/trade/orders/history?page=1&pageSize=50", undefined, userId);

    return data.items;
  },
  async getTradeQuote(stockCode: string): Promise<TradeQuoteSnapshot> {
    const normalized = normalizeStockCodeForBackend(stockCode);
    return fetchBackendResult<TradeQuoteSnapshot>(`/api/v1/trade/quote/${normalized}`);
  },
  async searchTradeTargets(keyword: string): Promise<TradeSearchPayload> {
    const safeKeyword = keyword.trim();
    return fetchBackendResult<TradeSearchPayload>(
      `/api/v1/trade/search?keyword=${encodeURIComponent(safeKeyword)}`
    );
  },
  subscribeTradeQuote(
    stockCode: string,
    handlers: {
      onMessage: (payload: TradeQuoteStreamPayload) => void;
      onError?: () => void;
    }
  ) {
    const language = getPreferredLanguage();
    const baseUrl = getApiBaseUrl();
    const url = new URL("/api/v1/trade/quote/stream", baseUrl);
    url.searchParams.set("stockCode", normalizeStockCodeForBackend(stockCode));
    url.searchParams.set("lang", language);

    const eventSource = new EventSource(url.toString());
    const onMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as TradeQuoteStreamPayload;
        handlers.onMessage(payload);
      } catch {
        // ignore malformed payload
      }
    };

    eventSource.addEventListener("quote", onMessage as EventListener);
    eventSource.onerror = () => {
      handlers.onError?.();
    };

    return () => {
      eventSource.removeEventListener("quote", onMessage as EventListener);
      eventSource.close();
    };
  },
};
