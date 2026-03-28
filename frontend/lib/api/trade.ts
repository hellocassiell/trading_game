import { getApiBaseUrl, getDemoUserId } from "./config";
import type {
  BackendResult,
  TradeOrderDraft,
  TradeSubmitResult,
} from "./types";

type BackendOrderRequest = {
  userId: string;
  stockCode: string;
  type: number;
  price: number;
  quantity: number;
};

function toBackendPayload(input: TradeOrderDraft): BackendOrderRequest {
  return {
    userId: input.userId ?? getDemoUserId(),
    stockCode: input.stockCode,
    type: input.side === "BUY" ? 1 : 2,
    price: Number(input.price.toFixed(3)),
    quantity: input.quantity,
  };
}

export async function placeTradeOrder(
  input: TradeOrderDraft
): Promise<TradeSubmitResult> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/orders/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(toBackendPayload(input)),
    });

    const result = (await response.json()) as BackendResult<string>;

    if (response.ok && result.code === 200 && result.data) {
      return {
        ok: true,
        orderId: result.data,
        message: result.msg || "success",
      };
    }

    return {
      ok: false,
      code: result.code || response.status,
      message: result.msg || "交易提交失败，请稍后重试",
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

