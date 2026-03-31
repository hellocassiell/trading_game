"use client";

import type { ReactNode } from "react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Info,
  Minus,
  Plus,
  Search,
  Trophy,
  X,
} from "lucide-react";

import {
  getTradeProductViewModel,
  getTradeSearchItems,
  submitTradeOrder,
} from "../lib/adapters/trade";
import { tradingApiClient } from "../lib/api";
import type { TradeOrderType, TradeSide } from "../lib/api/types";
import { useLanguage } from "./LanguageProvider";
import { byLanguage } from "../lib/locale";

type TradeProduct = {
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
  quoteUpdatedAt?: string;
};

type TradeTicketCardProps = {
  product?: TradeProduct;
  symbol?: string;
  onClose?: () => void;
  variant?: "trade" | "order";
  startWithSearch?: boolean;
  orderId?: string;
  orderStatus?: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED";
};

type SearchResult = {
  symbol: string;
  name: string;
  badge?: string;
};

function parseNumericValue(value: string | undefined) {
  if (!value) {
    return 0;
  }

  return Number(value.replace(/[^0-9.-]/g, ""));
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function isHongKongTradingHours(now: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value])
  );
  const weekday = parts.weekday;
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  if (!weekday || Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  if (weekday === "Sat" || weekday === "Sun") {
    return false;
  }

  const minutes = hour * 60 + minute;
  return (minutes >= 570 && minutes <= 720) || (minutes >= 780 && minutes <= 960);
}

function formatOrderStatusText(
  status: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED",
  copy: { pendingStatus: string; filledStatus: string; canceledStatus: string; rejectedStatus: string }
) {
  if (status === "PENDING" || status === "PARTIAL_FILLED") {
    return copy.pendingStatus;
  }
  if (status === "FILLED") {
    return copy.filledStatus;
  }
  if (status === "CANCELED") {
    return copy.canceledStatus;
  }
  return copy.rejectedStatus;
}

function DialogCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,20,10,0.36)] px-5">
      <div
        className={`relative w-full max-w-[330px] rounded-[16px] bg-white px-5 py-5 shadow-[0_28px_48px_rgba(36,20,4,0.22)] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[74px_1fr] items-center gap-3">
      <span className="text-helper text-[#9b8770]">{label}</span>
      <span className="text-body text-right font-black text-[#2a2723]">{value}</span>
    </div>
  );
}

function SearchPanel({
  query,
  onQueryChange,
  onClose,
  onPick,
  copy,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onClose?: () => void;
  onPick: (symbol: string) => void;
  copy: {
    searchStock: string;
    closeSearch: string;
    searchPlaceholder: string;
    clear: string;
    searchResults: string;
    recentHot: string;
    items: string;
    noResult: string;
    noResultHint: string;
  };
}) {
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const [visibleResults, setVisibleResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSearchResults() {
      setSearchLoading(true);
      const items = await getTradeSearchItems(normalizedQuery);
      if (!cancelled) {
        setVisibleResults(items);
        setSearchLoading(false);
      }
    }
    void loadSearchResults();
    return () => {
      cancelled = true;
    };
  }, [normalizedQuery]);

  return (
    <div className="overflow-hidden rounded-t-[30px] bg-white shadow-[0_-20px_44px_rgba(171,86,0,0.18)]">
      <div className="flex justify-center pt-2.5">
        <span className="h-1.5 w-12 rounded-full bg-[#dcc0a0]" />
      </div>

      <div className="flex items-center justify-between px-4 pb-3 pt-2">
        <div className="text-title font-black tracking-[0.04em] text-[#4b3a28]">{copy.searchStock}</div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#2f251d]"
            aria-label={copy.closeSearch}
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <div className="flex items-center gap-2 rounded-[16px] border border-[#f3dcc0] bg-[#fffaf3] px-3 py-3">
          <Search className="h-4 w-4 text-[var(--app-orange)]" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="text-body min-w-0 flex-1 bg-transparent font-semibold text-[#4e4338] outline-none placeholder:text-[#c1ab91]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-helper font-semibold text-[var(--app-orange-dark)]"
            >
              {copy.clear}
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-helper font-black text-[#8f795f]">
            {normalizedQuery ? copy.searchResults : copy.recentHot}
          </p>
          <p className="text-label text-[#bfa58a]">
            {searchLoading ? "..." : visibleResults.length} {copy.items}
          </p>
        </div>

        <div className="mt-2 overflow-hidden rounded-[18px] border border-[#f2e0cd] bg-white">
          {visibleResults.length > 0 ? (
            visibleResults.map((item, index) => (
              <button
                key={`${item.symbol}-${item.name}`}
                type="button"
                onClick={() => onPick(item.symbol)}
                className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left ${
                  index !== 0 ? "border-t border-[#f6ede3]" : ""
                } active:bg-[#fff7ee]`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-body font-black text-[#2f2b26]">{item.symbol}</p>
                    {item.badge ? (
                      <span className="text-label rounded-full bg-[#fff1de] px-2 py-0.5 font-bold text-[var(--app-orange-dark)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-helper mt-1 truncate text-[#8f7f6f]">
                    {item.name}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#c8aa85]" />
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-body font-black text-[#6b5a48]">{copy.noResult}</p>
              <p className="text-helper mt-2 text-[#b39981]">{copy.noResultHint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TradeTicketCard({
  product,
  symbol,
  onClose,
  variant = "trade",
  startWithSearch = false,
  orderId,
  orderStatus,
}: TradeTicketCardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": {
      currencyUnit: "港幣",
      pendingStatus: "排隊中",
      filledStatus: "已成交",
      canceledStatus: "已取消",
      rejectedStatus: "已拒絕",
      chooseTradableStock: "請選擇可交易港股",
      minPrice: (isBuy: boolean, min: number) => `${isBuy ? "買入" : "賣出"}價不得低於 HK$${min.toFixed(2)}`,
      lotSizeError: (size: number) => `交易股數必須為每手 ${size} 股的整數倍`,
      validityToday: "交易指示有效至本日收市",
      validityNextDay: "交易指示將於下一交易日執行",
      invalidTradeData: "請輸入有效的交易資料",
      orderIdMissingForAmend: "訂單編號缺失，暫無法改單",
      orderIdMissingForCancel: "訂單編號缺失，暫無法取消",
      amendSuccessEvent: "改單成功，原訂單已撤單",
      submitSuccessEvent: "下單成功",
      cancelSuccessEvent: "取消訂單成功",
      close: "關閉",
      competitionTitle: "智財港股投資大賽2026",
      sponsoredBy: "由 Citi 贊助",
      weeklyReminder: "要維持有效的參賽資格，請記得每周最少成功交易4次，加油!",
      tradesLeft: "今日尚餘交易次數",
      availableCash: "可動用投資金額",
      tradableStock: "可買賣股票",
      amendOrder: "更改訂單",
      quoteTimePrefix: "港股即時報價",
      openQuote: "跳至AASTOCKS查看報價",
      buy: "買入",
      sell: "賣出",
      quote: "報價",
      minTick: "最小變動 0.1",
      quantity: "股數",
      perLot: (size: number) => `每手 ${size} 股`,
      estimatedTotal: "預計總額 (含手續費)",
      submitting: "提交中...",
      submitAmend: "提交修改",
      submit: "提交",
      tradeNote: "(此為比賽交易)",
      tradeDetail: "交易詳情",
      orderIdPrefix: "訂單編號",
      orderStatusPrefix: "當前狀態",
      sideLabel: "買入 / 賣出",
      symbolLabel: "代號",
      orderPrice: "落盤價",
      fee: "手續費",
      estimatedTotalSimple: "預計總額",
      cancelOrder: "取消訂單",
      confirmCancelTitle: "確認取消訂單",
      confirmCancelDesc: "取消後不可恢復，是否繼續？",
      back: "返回",
      canceling: "取消中...",
      confirmCancel: "確認取消",
      confirmInstruction: "確認指示",
      cancel: "取消",
      confirm: "確定",
      submitSuccess: "提交成功",
      viewTradeStatus: "查看交易狀況",
      tradeAgain: "再次交易",
      backHome: "返回主頁",
      searchStock: "搜尋股票",
      closeSearch: "關閉搜尋",
      searchPlaceholder: "輸入股票編號名稱或代號",
      clear: "清除",
      searchResults: "搜尋結果",
      recentHot: "最近 / 熱門",
      items: "項",
      noResult: "找不到匹配股票",
      noResultHint: "可嘗試輸入代碼、名稱或拼音首字母",
    },
    "zh-Hans": {
      currencyUnit: "港币",
      pendingStatus: "排队中",
      filledStatus: "已成交",
      canceledStatus: "已取消",
      rejectedStatus: "已拒绝",
      chooseTradableStock: "请选择可交易港股",
      minPrice: (isBuy: boolean, min: number) => `${isBuy ? "买入" : "卖出"}价不得低于 HK$${min.toFixed(2)}`,
      lotSizeError: (size: number) => `交易股数必须为每手 ${size} 股的整数倍`,
      validityToday: "交易指示有效至本日收市",
      validityNextDay: "交易指示将于下一交易日执行",
      invalidTradeData: "请输入有效的交易资料",
      orderIdMissingForAmend: "订单编号缺失，暂无法改单",
      orderIdMissingForCancel: "订单编号缺失，暂无法取消",
      amendSuccessEvent: "改单成功，原订单已撤单",
      submitSuccessEvent: "下单成功",
      cancelSuccessEvent: "取消订单成功",
      close: "关闭",
      competitionTitle: "智财港股投资大赛2026",
      sponsoredBy: "由 Citi 赞助",
      weeklyReminder: "要维持有效的参赛资格，请记得每周最少成功交易4次，加油!",
      tradesLeft: "今日尚余交易次数",
      availableCash: "可动用投资金额",
      tradableStock: "可买卖股票",
      amendOrder: "更改订单",
      quoteTimePrefix: "港股即时报价",
      openQuote: "跳至AASTOCKS查看报价",
      buy: "买入",
      sell: "卖出",
      quote: "报价",
      minTick: "最小变动 0.1",
      quantity: "股数",
      perLot: (size: number) => `每手 ${size} 股`,
      estimatedTotal: "预计总额 (含手续费)",
      submitting: "提交中...",
      submitAmend: "提交修改",
      submit: "提交",
      tradeNote: "(此为比赛交易)",
      tradeDetail: "交易详情",
      orderIdPrefix: "订单编号",
      orderStatusPrefix: "当前状态",
      sideLabel: "买入 / 卖出",
      symbolLabel: "代号",
      orderPrice: "落盘价",
      fee: "手续费",
      estimatedTotalSimple: "预计总额",
      cancelOrder: "取消订单",
      confirmCancelTitle: "确认取消订单",
      confirmCancelDesc: "取消后不可恢复，是否继续？",
      back: "返回",
      canceling: "取消中...",
      confirmCancel: "确认取消",
      confirmInstruction: "确认指示",
      cancel: "取消",
      confirm: "确定",
      submitSuccess: "提交成功",
      viewTradeStatus: "查看交易状况",
      tradeAgain: "再次交易",
      backHome: "返回主页",
      searchStock: "搜索股票",
      closeSearch: "关闭搜索",
      searchPlaceholder: "输入股票编号名称或代号",
      clear: "清除",
      searchResults: "搜索结果",
      recentHot: "最近 / 热门",
      items: "项",
      noResult: "找不到匹配股票",
      noResultHint: "可尝试输入代码、名称或拼音首字母",
    },
    en: {
      currencyUnit: "HKD",
      pendingStatus: "Pending",
      filledStatus: "Filled",
      canceledStatus: "Canceled",
      rejectedStatus: "Rejected",
      chooseTradableStock: "Please choose a tradable HK stock",
      minPrice: (isBuy: boolean, min: number) => `${isBuy ? "Buy" : "Sell"} price must be >= HK$${min.toFixed(2)}`,
      lotSizeError: (size: number) => `Quantity must be a multiple of lot size ${size}`,
      validityToday: "Instruction valid until market close today",
      validityNextDay: "Instruction will execute on next trading day",
      invalidTradeData: "Please enter valid trade data",
      orderIdMissingForAmend: "Order ID missing. Cannot amend now.",
      orderIdMissingForCancel: "Order ID missing. Cannot cancel now.",
      amendSuccessEvent: "Order amended and original order canceled",
      submitSuccessEvent: "Order submitted",
      cancelSuccessEvent: "Order canceled",
      close: "Close",
      competitionTitle: "HK Stock Trading Game 2026",
      sponsoredBy: "Sponsored by Citi",
      weeklyReminder: "To keep an active entry, complete at least 4 successful trades every week.",
      tradesLeft: "Trades left today",
      availableCash: "Available cash",
      tradableStock: "Tradable stock",
      amendOrder: "Amend order",
      quoteTimePrefix: "Realtime HK quote",
      openQuote: "Open quote on AASTOCKS",
      buy: "Buy",
      sell: "Sell",
      quote: "Quote",
      minTick: "Min tick 0.1",
      quantity: "Quantity",
      perLot: (size: number) => `Lot size ${size}`,
      estimatedTotal: "Estimated total (incl. fee)",
      submitting: "Submitting...",
      submitAmend: "Submit amend",
      submit: "Submit",
      tradeNote: "(Competition trade)",
      tradeDetail: "Trade details",
      orderIdPrefix: "Order ID",
      orderStatusPrefix: "Status",
      sideLabel: "Buy / Sell",
      symbolLabel: "Symbol",
      orderPrice: "Order price",
      fee: "Fee",
      estimatedTotalSimple: "Estimated total",
      cancelOrder: "Cancel order",
      confirmCancelTitle: "Confirm cancellation",
      confirmCancelDesc: "This action cannot be undone. Continue?",
      back: "Back",
      canceling: "Canceling...",
      confirmCancel: "Confirm cancel",
      confirmInstruction: "Confirm instruction",
      cancel: "Cancel",
      confirm: "Confirm",
      submitSuccess: "Submitted",
      viewTradeStatus: "View trade status",
      tradeAgain: "Trade again",
      backHome: "Back home",
      searchStock: "Search stock",
      closeSearch: "Close search",
      searchPlaceholder: "Enter symbol or stock name",
      clear: "Clear",
      searchResults: "Results",
      recentHot: "Recent / Hot",
      items: "items",
      noResult: "No matching stock found",
      noResultHint: "Try stock code, name, or ticker keywords",
    },
  });
  const [activeProduct, setActiveProduct] = useState<TradeProduct | undefined>(product);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState(parseNumericValue(product?.defaultPrice ?? product?.price));
  const [quantity, setQuantity] = useState(parseNumericValue(product?.defaultQuantity ?? "10"));
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(startWithSearch);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(variant === "order");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [cancelPending, setCancelPending] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [isTradingHours, setIsTradingHours] = useState(false);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<
    "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | undefined
  >(orderStatus);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProduct(product);
    setSide("buy");
    setPrice(parseNumericValue(product?.defaultPrice ?? product?.price));
    setQuantity(parseNumericValue(product?.defaultQuantity ?? "10") || 10);
    setQuery("");
    setShowSearch(startWithSearch);
    setShowConfirm(false);
    setShowSuccess(false);
    setShowDetails(variant === "order");
    setShowCancelConfirm(false);
    setSubmitError(null);
    setCancelError(null);
    setSubmitPending(false);
    setCancelPending(false);
    setCurrentOrderStatus(orderStatus);
    setLastOrderId(null);
  }, [product, startWithSearch, variant, orderStatus]);

  useEffect(() => {
    setIsTradingHours(isHongKongTradingHours());
  }, []);

  useEffect(() => {
    if (product || !symbol) {
      return;
    }
    const targetSymbol = symbol;
    let cancelled = false;
    async function loadProduct() {
      setProductLoading(true);
      const nextProduct = await getTradeProductViewModel(targetSymbol);
      if (!cancelled) {
        setActiveProduct(nextProduct);
        setPrice(parseNumericValue(nextProduct.defaultPrice ?? nextProduct.price));
        setQuantity(parseNumericValue(nextProduct.defaultQuantity ?? nextProduct.lotSize ?? "100"));
        setProductLoading(false);
      }
    }
    void loadProduct();
    return () => {
      cancelled = true;
    };
  }, [product, symbol]);

  const currentProduct = activeProduct;
  const currencyUnit = copy.currencyUnit;
  const lotSize = Math.max(1, parseNumericValue(currentProduct?.lotSize ?? "10"));
  const displayQuantity = Math.max(lotSize, quantity || lotSize);
  const displayPrice = price || parseNumericValue(currentProduct?.price ?? "0");
  const grossAmount = displayPrice * displayQuantity;
  const feeAmount = Math.max(1, Number((grossAmount * 0.00075).toFixed(3)));
  const totalAmount = side === "buy" ? grossAmount + feeAmount : Math.max(0, grossAmount - feeAmount);
  const tradesLeft = currentProduct?.remainingTrades ?? "19";
  const availableCashRaw = parseNumericValue(currentProduct?.cashBalance ?? currentProduct?.cash ?? "1912735");
  const availableCash = `HK$ ${formatNumber(availableCashRaw)}`;
  const currentPriceText = `${formatNumber(displayPrice)} ${currencyUnit}`;
  const feeText = `${formatNumber(feeAmount)} ${currencyUnit}`;
  const totalText = `${formatNumber(totalAmount)} ${currencyUnit}`;
  const quoteValue = Number(currentProduct?.price ?? 0);
  const priceChangeValue = parseNumericValue(currentProduct?.change?.split(" ")[0] ?? "0");
  const isNegative = priceChangeValue < 0;
  const changeArrow = isNegative ? "▼" : "▲";
  const changeTone = isNegative ? "text-[#ef4444]" : "text-[#26b26a]";
  const changePct = currentProduct?.change?.match(/\(([^)]+)\)/)?.[1] ?? "0.075%";
  const orderSide: TradeSide = side === "buy" ? "BUY" : "SELL";
  const orderType: TradeOrderType = "LIMIT";
  const minPrice = side === "buy" ? 0.05 : 0.01;
  const validationError = !currentProduct
    ? copy.chooseTradableStock
    : displayPrice < minPrice
      ? copy.minPrice(side === "buy", minPrice)
      : displayQuantity % lotSize !== 0
        ? copy.lotSizeError(lotSize)
        : null;
  const canSubmit =
    !!currentProduct &&
    displayPrice > 0 &&
    displayQuantity > 0 &&
    !validationError &&
    !submitPending;
  const validityText = isTradingHours
    ? copy.validityToday
    : copy.validityNextDay;
  const isDetailOnly = variant === "order" && showDetails;
  const canCancelOrder =
    !!orderId &&
    (currentOrderStatus === "PENDING" || currentOrderStatus === "PARTIAL_FILLED");

  const adjustPrice = (delta: number) => {
    setPrice((current) => Math.max(0.001, Number(((current || 0) + delta).toFixed(3))));
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(lotSize, (current || lotSize) + delta * lotSize));
  };

  const openSearch = () => {
    setQuery("");
    setSubmitError(null);
    setShowSearch(true);
  };

  const handleSearchPick = async (stockCode: string) => {
    const nextProduct = await getTradeProductViewModel(stockCode);
    setActiveProduct(nextProduct);
    setPrice(parseNumericValue(nextProduct.defaultPrice ?? nextProduct.price));
    setQuantity(parseNumericValue(nextProduct.defaultQuantity ?? nextProduct.lotSize ?? "10"));
    setShowSearch(false);
    setShowConfirm(false);
    setShowSuccess(false);
    setSubmitError(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      setSubmitError(validationError ?? copy.invalidTradeData);
      return;
    }

    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!currentProduct || validationError) {
      setShowConfirm(false);
      setSubmitError(validationError ?? copy.chooseTradableStock);
      return;
    }

    setSubmitPending(true);
    setSubmitError(null);

    if (variant === "order") {
      if (!orderId) {
        setSubmitPending(false);
        setShowConfirm(false);
        setSubmitError(copy.orderIdMissingForAmend);
        return;
      }
      const amendResult = await tradingApiClient.amendOrder(orderId, displayPrice, displayQuantity);
      setSubmitPending(false);
      if (!amendResult.ok) {
        setShowConfirm(false);
        setSubmitError(amendResult.message);
        return;
      }
      setCurrentOrderStatus("CANCELED");
      setLastOrderId(amendResult.orderId);
      setShowConfirm(false);
      setShowSuccess(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("trade-order-updated", {
            detail: {
              type: "amend_success",
              orderId: amendResult.orderId,
              message: copy.amendSuccessEvent,
            },
          })
        );
      }
      return;
    }

    const result = await submitTradeOrder({
      stockCode: currentProduct.symbol,
      side: orderSide,
      orderType,
      price: displayPrice,
      quantity: displayQuantity,
    });

    setSubmitPending(false);

    if (!result.ok) {
      setShowConfirm(false);
      setSubmitError(result.message);
      return;
    }

    setLastOrderId(result.orderId);
    setShowConfirm(false);
    setShowSuccess(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("trade-order-updated", {
          detail: {
            type: "submit_success",
            orderId: result.orderId,
            message: copy.submitSuccessEvent,
          },
        })
      );
    }
  };

  const closeAll = () => {
    setShowSuccess(false);
    setShowConfirm(false);
    setSubmitError(null);
    onClose?.();
    startTransition(() => {
      router.push("/");
    });
  };

  const handleCancelOrder = async () => {
    if (!orderId) {
      setCancelError(copy.orderIdMissingForCancel);
      return;
    }
    setCancelPending(true);
    setCancelError(null);
    const result = await tradingApiClient.cancelOrder(orderId);
    setCancelPending(false);
    if (!result.ok) {
      setCancelError(result.message);
      return;
    }
    setCurrentOrderStatus("CANCELED");
    setShowCancelConfirm(false);
    setCancelError(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("trade-order-updated", {
          detail: {
            type: "cancel_success",
            orderId,
            message: copy.cancelSuccessEvent,
          },
        })
      );
    }
    setShowDetails(false);
    onClose?.();
  };

  if (showSearch) {
    return (
      <SearchPanel
        query={query}
        onQueryChange={setQuery}
        onClose={currentProduct ? () => setShowSearch(false) : onClose}
        onPick={handleSearchPick}
        copy={{
          searchStock: copy.searchStock,
          closeSearch: copy.closeSearch,
          searchPlaceholder: copy.searchPlaceholder,
          clear: copy.clear,
          searchResults: copy.searchResults,
          recentHot: copy.recentHot,
          items: copy.items,
          noResult: copy.noResult,
          noResultHint: copy.noResultHint,
        }}
      />
    );
  }

  if (!currentProduct) {
    if (productLoading) {
      return (
        <div className="overflow-hidden rounded-t-[30px] bg-white px-5 py-10 text-center shadow-[0_-20px_44px_rgba(171,86,0,0.18)]">
          <p className="text-body font-semibold text-[#8f7f6f]">Loading quote...</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative">
      {!isDetailOnly ? (
        <div className="overflow-hidden rounded-t-[30px] bg-white shadow-[0_-20px_44px_rgba(171,86,0,0.18)]">
          <div className="flex justify-center bg-white pt-2.5">
            <span className="h-1.5 w-12 rounded-full bg-[#dcc0a0]" />
          </div>

          <header className="bg-white">
            <div className="flex h-11 items-center justify-between px-3.5">
              <div className="w-7" />
              <div className="text-helper flex items-center gap-1 font-bold tracking-[0.04em] text-[#4b3a28]">
                <span>AASTOCKS</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#2f251d]"
                  aria-label={copy.close}
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <div className="text-label flex items-center justify-between border-t border-[#f1e5d6] px-3.5 py-2.5">
              <div className="flex items-center gap-2 font-semibold text-[#504030]">
                <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#fff1de] text-[var(--app-orange-dark)]">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
                <span>{copy.competitionTitle}</span>
              </div>
              <span className="font-semibold text-[#7b6450]">{copy.sponsoredBy}</span>
            </div>

            <div className="text-helper bg-[#5e6670] px-3.5 py-2 leading-relaxed text-white">
              {copy.weeklyReminder}
            </div>
          </header>

          <main className="bg-white">
            <section className="text-helper grid grid-cols-2 border-b border-[#efe5d8] px-3.5 py-2.5">
              <div>
                <p className="text-[#907a63]">{copy.tradesLeft}</p>
                <p className="text-title mt-1 font-bold text-[#25282d]">{tradesLeft}</p>
              </div>
              <div className="text-right">
                <p className="text-[#907a63]">{copy.availableCash}</p>
                <p className="text-title mt-1 font-bold text-[#25282d]">{availableCash}</p>
              </div>
            </section>

            <section className="border-b border-[#efe5d8] px-3.5 py-3">
              <button
                type="button"
                onClick={openSearch}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#f3dcc0] bg-[#fffaf3] px-3 py-2.5 text-left active:bg-[#fff3e3]"
              >
                <div className="text-helper flex items-center gap-1 font-semibold text-[#5d4b3d]">
                  <span>{copy.tradableStock}</span>
                  <Info className="h-3.5 w-3.5 text-[#c59b6e]" />
                </div>
                <div className="text-body flex items-center gap-2 font-semibold text-[#32271e]">
                  <Search className="h-4 w-4 text-[#c59b6e]" />
                  <span>{currentProduct.symbol}</span>
                </div>
              </button>

              <div className="relative mt-3 overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,193,126,0.14),transparent_58%)] py-4 text-center">
                {variant === "order" ? (
                  <p className="text-helper mb-1 font-semibold tracking-[0.06em] text-[var(--app-orange-dark)]">
                    {copy.amendOrder}
                  </p>
                ) : null}
                <p className="text-page px-4 font-black text-[#1f2328]">{currentProduct.company}</p>
                <div className={`mt-2 flex items-end justify-center gap-1.5 ${changeTone}`}>
                  <span className="text-helper leading-none">{changeArrow}</span>
                  <span className="text-number font-black leading-none">{formatNumber(quoteValue || displayPrice)}</span>
                  <span className="text-helper font-semibold leading-none">
                    {formatNumber(Math.abs(priceChangeValue))} ({changePct})
                  </span>
                </div>
                <p className="text-label mt-1 text-[#baa28b]">
                  {copy.quoteTimePrefix} {currentProduct.quoteUpdatedAt ?? "2021/04/21 11:00 HKT"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    startTransition(() => {
                      router.push("/quotes");
                    });
                  }}
                  className="text-helper mt-2 inline-flex items-center gap-1 font-semibold text-[var(--app-orange-dark)]"
                >
                  {copy.openQuote}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </section>

            <section className="border-b border-[#efe5d8] px-3.5 py-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={`text-body flex h-11 items-center justify-center rounded-[12px] border font-bold transition-all ${
                    side === "buy"
                      ? "border-[var(--app-orange)] bg-[#fff4e3] text-[var(--app-orange-dark)]"
                      : "border-[#ddd3c8] bg-white text-[#c2b8ae]"
                  }`}
                >
                  {copy.buy}
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={`text-body flex h-11 items-center justify-center rounded-[12px] border font-bold transition-all ${
                    side === "sell"
                      ? "border-[#ee5b62] bg-[#fff1f1] text-[#ee5b62]"
                      : "border-[#ddd3c8] bg-white text-[#c2b8ae]"
                  }`}
                >
                  {copy.sell}
                </button>
              </div>
            </section>

            <section className="px-3.5 py-1">
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 border-b border-[#f1e7da] py-3">
                <span className="text-helper text-[#907a63]">{copy.quote}({currencyUnit})</span>
                <button
                  type="button"
                  onClick={() => adjustPrice(-0.1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-title text-center font-bold text-[#23262b]">
                  {formatNumber(displayPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => adjustPrice(0.1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-label text-right text-[#bc9871]">{copy.minTick}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 py-3">
                <span className="text-helper text-[#907a63]">{copy.quantity}</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-title text-center font-bold text-[#23262b]">
                  {displayQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-label text-right text-[#bc9871]">{copy.perLot(lotSize)}</span>
              </div>
            </section>
          </main>

          <footer className="border-t border-[#efe5d8] bg-white px-3.5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
            <div className="flex items-end justify-between">
              <span className="text-helper font-semibold text-[#6a594b]">{copy.estimatedTotal}</span>
              <div className="text-right">
                <p className="text-title font-black text-[#23262b]">{totalText}</p>
                <p className="text-label mt-0.5 text-[#b5a08a]">{feeText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`text-body mt-3 flex h-12 w-full items-center justify-center rounded-[18px] font-bold transition-all active:scale-[0.98] ${
                canSubmit
                  ? "bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] text-white shadow-[0_10px_24px_rgba(255,140,26,0.24)]"
                  : "bg-[#ecd5bd] text-white"
              }`}
            >
              {submitPending ? copy.submitting : variant === "order" ? copy.submitAmend : copy.submit}
            </button>
            <p className="text-label pt-1.5 text-center text-[#b5a08a]">{validityText}</p>
            {submitError ? (
              <p className="text-helper mt-2 rounded-[14px] bg-[#fff2ef] px-3 py-2 font-semibold text-[#d0524a]">
                {submitError}
              </p>
            ) : validationError ? (
              <p className="text-helper mt-2 rounded-[14px] bg-[#fff8ef] px-3 py-2 font-semibold text-[#b07633]">
                {validationError}
              </p>
            ) : null}
            <p className="text-label pt-1.5 text-center text-[#b5a08a]">{copy.tradeNote}</p>
          </footer>
        </div>
      ) : null}

      {showDetails ? (
        <DialogCard>
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
                return;
              }
              setShowDetails(false);
            }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[#7e6a55]"
            aria-label={copy.close}
          >
            <X className="h-4.5 w-4.5" />
          </button>
          <h3 className="text-page text-center font-black text-[#27231f]">{copy.tradeDetail}</h3>
          {orderId ? (
            <p className="text-helper mt-1 text-center text-[#9f8669]">
              {copy.orderIdPrefix} {orderId}
            </p>
          ) : null}
          {currentOrderStatus ? (
            <p className="text-helper mt-1 text-center text-[#9f8669]">
              {copy.orderStatusPrefix} {formatOrderStatusText(currentOrderStatus, copy)}
            </p>
          ) : null}
          <div className="mt-5 space-y-3">
            <SummaryRow label={copy.sideLabel} value={side === "buy" ? copy.buy : copy.sell} />
            <SummaryRow label={copy.symbolLabel} value={currentProduct.symbol} />
            <SummaryRow label={copy.quantity} value={String(displayQuantity)} />
            <SummaryRow label={copy.orderPrice} value={currentPriceText} />
            <SummaryRow label={copy.fee} value={feeText} />
            <SummaryRow label={copy.estimatedTotalSimple} value={totalText} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowDetails(false)}
            className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
          >
              {copy.amendOrder}
            </button>
            <button
              type="button"
              disabled={!canCancelOrder}
              onClick={() => {
                if (!canCancelOrder) {
                  return;
                }
                setShowCancelConfirm(true);
              }}
              className={`text-body flex h-11 items-center justify-center rounded-full font-black text-white ${
                canCancelOrder
                  ? "bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)]"
                  : "bg-[#d8d0c7]"
              }`}
            >
              {copy.cancelOrder}
            </button>
          </div>
          {cancelError ? (
            <p className="text-helper mt-3 rounded-[12px] bg-[#fff2ef] px-3 py-2 text-[#d0524a]">
              {cancelError}
            </p>
          ) : null}
        </DialogCard>
      ) : null}

      {showCancelConfirm ? (
        <DialogCard>
          <h3 className="text-page text-center font-black text-[#27231f]">{copy.confirmCancelTitle}</h3>
          <p className="text-helper mt-3 text-center text-[#9f8669]">
            {copy.confirmCancelDesc}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              {copy.back}
            </button>
            <button
              type="button"
              disabled={cancelPending}
              onClick={handleCancelOrder}
              className="text-body flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] font-black text-white"
            >
              {cancelPending ? copy.canceling : copy.confirmCancel}
            </button>
          </div>
        </DialogCard>
      ) : null}

      {showConfirm ? (
        <DialogCard>
          <h3 className="text-page text-center font-black text-[#27231f]">{copy.confirmInstruction}</h3>
          <div className="mt-5 space-y-3">
            <SummaryRow label={copy.sideLabel} value={side === "buy" ? copy.buy : copy.sell} />
            <SummaryRow label={copy.symbolLabel} value={currentProduct.symbol} />
            <SummaryRow label={copy.quantity} value={String(displayQuantity)} />
            <SummaryRow label={copy.orderPrice} value={currentPriceText} />
            <SummaryRow label={copy.fee} value={feeText} />
            <SummaryRow label={copy.estimatedTotalSimple} value={totalText} />
          </div>

          <p className="text-label mt-5 text-center text-[#ad957e]">{validityText}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitPending}
              className="text-body flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] font-black text-white"
            >
              {submitPending ? copy.submitting : copy.confirm}
            </button>
          </div>
        </DialogCard>
      ) : null}

      {showSuccess ? (
        <DialogCard>
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1de] text-[var(--app-orange-dark)]">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 text-center text-[18px] font-black text-[#27231f]">{copy.submitSuccess}</h3>
          {lastOrderId ? (
            <p className="text-helper mt-2 text-center font-semibold text-[#9c7f61]">
              {copy.orderIdPrefix} {lastOrderId}
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                onClose?.();
                startTransition(() => {
                  router.push("/records");
                });
              }}
              className="text-body flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] font-black text-white"
            >
              {copy.viewTradeStatus}
            </button>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="text-body flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              {copy.tradeAgain}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                onClose?.();
                startTransition(() => {
                  router.push("/quotes");
                });
              }}
              className="text-body flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              {copy.openQuote}
            </button>
            <button
              type="button"
              onClick={closeAll}
              className="text-body flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              {copy.backHome}
            </button>
          </div>
        </DialogCard>
      ) : null}
    </div>
  );
}
