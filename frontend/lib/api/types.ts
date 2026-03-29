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

export type TradeCancelResult =
  | {
      ok: true;
      orderId: string;
      status: TradeOrderStatus;
      releasedCash: number;
      releasedQuantity: number;
    }
  | {
      ok: false;
      message: string;
      code?: number;
    };

export type AccountAssets = {
  userId: string;
  nickname: string;
  avatar: string;
  currency: string;
  rank: number;
  rankDelta: number;
  dailyTradesRemaining: number;
  weeklyTradesRequired: number;
  weeklyTradesRemaining: number;
  initialCapital: number;
  bonusAmount: number;
  securitiesMarketValue: number;
  cashAvailable: number;
  totalAssets: number;
  updatedAt: string;
};

export type Position = {
  stockCode: string;
  stockName: string;
  quantity: number;
  tradableQuantity: number;
  averagePrice: number;
  currentPrice: number;
  pnlAmount: number;
  pnlPercent: number;
  referenceMarketValue: number;
};

export type TradeOrderStatus =
  | "PENDING"
  | "PARTIAL_FILLED"
  | "FILLED"
  | "CANCELED"
  | "REJECTED";

export type TradeOrderDetail = {
  orderId: string;
  stockCode: string;
  stockName: string;
  direction: TradeSide;
  orderType: TradeOrderType;
  price: number;
  quantity: number;
  filledQuantity: number;
  filledAvgPrice: number;
  status: TradeOrderStatus;
  feeAmount: number;
  createdAt: string | null;
  canAmend: boolean;
  canCancel: boolean;
};

export type ActiveOrder = TradeOrderDetail;
export type TradeHistoryItem = TradeOrderDetail;
