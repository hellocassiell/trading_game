export type BackendResult<T> = {
  code: number;
  msg: string;
  data: T;
};

export type ViewStatus = "loading" | "empty" | "error" | "success";

export type TradeSide = "BUY" | "SELL";
export type TradeOrderType = "LIMIT" | "MARKET";

export type TradeOrderDraft = {
  userId?: string;
  stockCode: string;
  side: TradeSide;
  orderType: TradeOrderType;
  price: number;
  quantity: number;
};

export type TradeSubmitResult =
  | {
      ok: true;
      orderId: string;
      message: string;
    }
  | {
      ok: false;
      message: string;
      code?: number;
    };

