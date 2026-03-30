import { getApiBaseUrl, getAuthToken, getDemoUserId } from "./config";
import type {
  AccountAssets,
  ActiveOrder,
  BackendResult,
  Position,
  TradeOrderDraft,
  TradeHistoryItem,
  TradeCancelResult,
  TradeOrderStatus,
  TradeSubmitResult,
} from "./types";

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
  userId?: string
): Promise<T> {
  const authToken = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId ?? getDemoUserId(),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const result = (await response.json()) as BackendResult<T>;

  if (!response.ok || result.code !== 200) {
    throw new Error(result.msg || "请求失败，请稍后重试");
  }

  return result.data;
}

export async function placeTradeOrder(
  input: TradeOrderDraft
): Promise<TradeSubmitResult> {
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
          : "网络异常，暂时无法提交交易",
    };
  }
}

export const tradingApiClient = {
  placeTradeOrder,
  async cancelOrder(orderId: string, userId?: string): Promise<TradeCancelResult> {
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
            : "网络异常，暂时无法取消订单",
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
            : "网络异常，暂时无法修改订单",
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
};
