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
  frozenQuantity?: number;
  transitQuantity?: number;
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
  settlementDate?: string | null;
  settlementStatus?: "PENDING" | "SETTLED";
  matchedQuantity?: number;
  matchedAmount?: number;
  totalFee?: number;
  estimatedNetCashFlow?: number;
  lastMatchedAt?: string | null;
  createdAt: string | null;
  canAmend: boolean;
  canCancel: boolean;
};

export type ActiveOrder = TradeOrderDetail;
export type TradeHistoryItem = TradeOrderDetail;

export type QuoteDepthLevel = {
  price: number;
  volume: number;
};

export type TradeQuoteSnapshot = {
  stockCode: string;
  stockName: string;
  currency: string;
  currentPrice: number;
  prevClose: number;
  changeAmount: number;
  changePercent: number;
  tickSize: number;
  lotSize: number;
  suspended: boolean;
  tradable: boolean;
  updatedAt: string;
  bidPrice: number;
  askPrice: number;
  source: "MOCK" | "REALTIME";
  orderBook: {
    bids: QuoteDepthLevel[];
    asks: QuoteDepthLevel[];
    sequence: number;
  };
  lang?: string;
};

export type TradeQuoteStreamPayload = {
  stockCode: string;
  nominalPrice?: number;
  lastPrice?: number;
  asks?: QuoteDepthLevel[];
  bids?: QuoteDepthLevel[];
  updatedAt?: string;
  sequence?: number;
};

export type HomeEventStatsPayload = {
  participantCount: number;
  holdingAssetValue: number;
  tradingAmount: number;
  tradingCount: number;
  todayTradingAmount?: number;
  todayTradingCount?: number;
  totalTradingAmount?: number;
  totalTradingCount?: number;
  updatedAt?: string;
};

export type HomeStarParticipantPayload = {
  name: string;
  tag: string;
  intro: string;
  totalAssets: number;
  holding?: string;
  topHolding?: string;
  recentTrade: string;
};

export type HomeTopHoldingPayload = {
  stockCode: string;
  stockName: string;
  holders: number;
  holdingValue: number;
};

export type HomeTurnoverPayload = {
  stockCode: string;
  stockName: string;
  amount: number;
};

export type HomeWeeklyFlyerPayload = {
  name: string;
  tag: string;
  period: string;
  gainLabel: string;
  gain: string;
  riseLabel: string;
  rise: number;
};

export type RankingRowPayload = {
  rank: number;
  rankMovement: "UP" | "DOWN" | "SAME";
  nickname: string;
  totalAssets: number;
  changePercent: number;
  isCurrentUser?: boolean;
};

export type HomeOverviewPayload = {
  competition: {
    name: string;
    sponsor: string;
    currency: string;
    updatedAt: string;
  };
  eventStats: HomeEventStatsPayload;
  banner?: {
    title: string;
    ctaText: string;
    linkType: string;
  };
  mySummary: AccountAssets;
  starParticipants?: {
    tabs: string[];
    items: Record<string, HomeStarParticipantPayload>;
    updatedAt?: string;
  };
  topHoldings?: {
    items: HomeTopHoldingPayload[];
    updatedAt?: string;
  };
  topTurnover?: {
    buy: HomeTurnoverPayload[];
    sell: HomeTurnoverPayload[];
    updatedAt?: string;
  };
  weeklyFlyers?: {
    tabs: string[];
    items: Record<string, HomeWeeklyFlyerPayload>;
    updatedAt?: string;
  };
  ranking?: RankingRowPayload[];
  rankingUpdatedAt?: string;
  lang?: string;
};

export type StarTraderLeaderboardItem = {
  userId: string;
  rank: number;
  name: string;
  tag: string;
  intro: string;
  totalAssets: number;
  holding?: string;
  topHolding?: string;
  recentTrade: string;
  securitiesMarketValue?: number;
  cashEstimate?: number;
  changePercent?: number;
};

export type StarTradersLeaderboardPayload = {
  currentUserId: string;
  total: number;
  items: StarTraderLeaderboardItem[];
  updatedAt: string;
  lang?: string;
};

export type TopHoldingsLeaderboardItem = {
  stockCode: string;
  stockName: string;
  holders: number;
  holdingValue: number;
  changeAmount?: number;
  changePercent?: number;
  movement?: "UP" | "DOWN" | "SAME";
};

export type TopHoldingsLeaderboardPayload = {
  total: number;
  items: TopHoldingsLeaderboardItem[];
  updatedAt: string;
  lang?: string;
};

export type TopLoserHoldingsLeaderboardItem = {
  stockCode: string;
  stockName: string;
  holders?: number;
  lossAmount: number;
  movement?: "UP" | "DOWN" | "SAME";
};

export type TopLoserHoldingsLeaderboardPayload = {
  total: number;
  items: TopLoserHoldingsLeaderboardItem[];
  updatedAt: string;
  lang?: string;
};

export type TopTurnoverLeaderboardItem = {
  stockCode: string;
  stockName: string;
  amount: number;
};

export type TopTurnoverLeaderboardPayload = {
  buy: TopTurnoverLeaderboardItem[];
  sell: TopTurnoverLeaderboardItem[];
  updatedAt: string;
  lang?: string;
};

export type RankingsLeaderboardPayload = {
  page: number;
  pageSize: number;
  total: number;
  items: RankingRowPayload[];
  updatedAt: string;
  lang?: string;
};

export type TradeSearchItem = {
  stockCode: string;
  stockName: string;
  currentPrice?: number;
  changeAmount?: number;
  changePercent?: number;
  lotSize?: number;
  suspended?: boolean;
};

export type TradeSearchPayload = {
  keyword: string;
  total: number;
  items: TradeSearchItem[];
  updatedAt: string;
  lang?: string;
};
