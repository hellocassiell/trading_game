"use client";

import type { ReactNode } from "react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
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
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function getCurrencyUnit() {
  return "港币";
}

function formatOrderStatusText(
  status: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED"
) {
  if (status === "PENDING" || status === "PARTIAL_FILLED") {
    return "排队中";
  }
  if (status === "FILLED") {
    return "已成交";
  }
  if (status === "CANCELED") {
    return "已取消";
  }
  return "已拒绝";
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
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onClose?: () => void;
  onPick: (symbol: string) => void;
}) {
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toUpperCase();
  const mergedResults = useMemo<SearchResult[]>(() => {
    return getTradeSearchItems();
  }, []);

  const visibleResults = normalizedQuery
    ? mergedResults.filter((item) => {
        const product = getTradeProductViewModel(item.symbol);
        const searchable = [item.symbol, item.name, product.company].join(" ").toUpperCase();
        return searchable.includes(normalizedQuery);
      })
    : mergedResults;

  return (
    <div className="overflow-hidden rounded-t-[30px] bg-white shadow-[0_-20px_44px_rgba(171,86,0,0.18)]">
      <div className="flex justify-center pt-2.5">
        <span className="h-1.5 w-12 rounded-full bg-[#dcc0a0]" />
      </div>

      <div className="flex items-center justify-between px-4 pb-3 pt-2">
        <div className="text-title font-black tracking-[0.04em] text-[#4b3a28]">搜索股票</div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#2f251d]"
            aria-label="关闭搜索"
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
            placeholder="输入股票编号名称或代号"
            className="text-body min-w-0 flex-1 bg-transparent font-semibold text-[#4e4338] outline-none placeholder:text-[#c1ab91]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-helper font-semibold text-[var(--app-orange-dark)]"
            >
              清除
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-helper font-black text-[#8f795f]">
            {normalizedQuery ? "搜索结果" : "最近 / 热门"}
          </p>
          <p className="text-label text-[#bfa58a]">{visibleResults.length} 项</p>
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
                    {getTradeProductViewModel(item.symbol).company || item.name}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#c8aa85]" />
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-body font-black text-[#6b5a48]">找不到匹配股票</p>
              <p className="text-helper mt-2 text-[#b39981]">可尝试输入代码、名称或拼音首字母</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TradeTicketCard({
  product,
  onClose,
  variant = "trade",
  startWithSearch = false,
  orderId,
  orderStatus,
}: TradeTicketCardProps) {
  const router = useRouter();
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

  const currentProduct = activeProduct;
  const currencyUnit = getCurrencyUnit();
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
    ? "请选择可交易港股"
    : displayPrice < minPrice
      ? `${side === "buy" ? "买入" : "卖出"}价不得低于 HK$${minPrice.toFixed(2)}`
      : displayQuantity % lotSize !== 0
        ? `交易股数必须为每手 ${lotSize} 股的整数倍`
        : null;
  const canSubmit =
    !!currentProduct &&
    displayPrice > 0 &&
    displayQuantity > 0 &&
    !validationError &&
    !submitPending;
  const isTradingHours = (() => {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();

    if (day === 0 || day === 6) {
      return false;
    }

    return (minutes >= 570 && minutes <= 720) || (minutes >= 780 && minutes <= 960);
  })();
  const validityText = isTradingHours
    ? "交易指示有效至本日收市"
    : "交易指示将于下一交易日执行";
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

  const handleSearchPick = (symbol: string) => {
    const nextProduct = getTradeProductViewModel(symbol);

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
      setSubmitError(validationError ?? "请输入有效的交易资料");
      return;
    }

    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!currentProduct || validationError) {
      setShowConfirm(false);
      setSubmitError(validationError ?? "请选择可交易港股");
      return;
    }

    setSubmitPending(true);
    setSubmitError(null);

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
    if (variant === "order" && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("trade-order-updated", {
          detail: {
            type: "amend_success",
            orderId: result.orderId,
            message: "改单成功",
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
      setCancelError("订单编号缺失，暂无法取消");
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
            message: "取消订单成功",
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
      />
    );
  }

  if (!currentProduct) {
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
                  aria-label="关闭"
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
                <span>智财港股投资大赛2020</span>
              </div>
              <span className="font-semibold text-[#7b6450]">由 Citi 赞助</span>
            </div>

            <div className="text-helper bg-[#5e6670] px-3.5 py-2 leading-relaxed text-white">
              要维持有效的参赛资格，请记得每週最少成功交易4次，加油!
            </div>
          </header>

          <main className="bg-white">
            <section className="text-helper grid grid-cols-2 border-b border-[#efe5d8] px-3.5 py-2.5">
              <div>
                <p className="text-[#907a63]">今日尚馀交易次数</p>
                <p className="text-title mt-1 font-bold text-[#25282d]">{tradesLeft}</p>
              </div>
              <div className="text-right">
                <p className="text-[#907a63]">可动用投资金额</p>
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
                  <span>可买卖股票</span>
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
                    更改订单
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
                  港股即时报价 {currentProduct.quoteUpdatedAt ?? "2021/04/21 11:00 HKT"}
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
                  跳至AASTOCKS查看报价
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
                  买入
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
                  卖出
                </button>
              </div>
            </section>

            <section className="px-3.5 py-1">
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 border-b border-[#f1e7da] py-3">
                <span className="text-helper text-[#907a63]">报价({currencyUnit})</span>
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
                <span className="text-label text-right text-[#bc9871]">最小变动 0.1</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 py-3">
                <span className="text-helper text-[#907a63]">股数</span>
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
                <span className="text-label text-right text-[#bc9871]">每手 {lotSize} 股</span>
              </div>
            </section>
          </main>

          <footer className="border-t border-[#efe5d8] bg-white px-3.5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
            <div className="flex items-end justify-between">
              <span className="text-helper font-semibold text-[#6a594b]">预计总额 (含手续费)</span>
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
              {submitPending ? "提交中..." : variant === "order" ? "提交修改" : "提交"}
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
            <p className="text-label pt-1.5 text-center text-[#b5a08a]">(此为比赛交易)</p>
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
            aria-label="关闭"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          <h3 className="text-page text-center font-black text-[#27231f]">交易详情</h3>
          {orderId ? (
            <p className="text-helper mt-1 text-center text-[#9f8669]">
              订单编号 {orderId}
            </p>
          ) : null}
          {currentOrderStatus ? (
            <p className="text-helper mt-1 text-center text-[#9f8669]">
              当前状态 {formatOrderStatusText(currentOrderStatus)}
            </p>
          ) : null}
          <div className="mt-5 space-y-3">
            <SummaryRow label="买入 / 卖出" value={side === "buy" ? "买入" : "卖出"} />
            <SummaryRow label="代号" value={currentProduct.symbol} />
            <SummaryRow label="股数" value={String(displayQuantity)} />
            <SummaryRow label="落盘价" value={currentPriceText} />
            <SummaryRow label="手续费" value={feeText} />
            <SummaryRow label="预计总额" value={totalText} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              更改订单
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
              取消订单
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
          <h3 className="text-page text-center font-black text-[#27231f]">确认取消订单</h3>
          <p className="text-helper mt-3 text-center text-[#9f8669]">
            取消后不可恢复，是否继续？
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              返回
            </button>
            <button
              type="button"
              disabled={cancelPending}
              onClick={handleCancelOrder}
              className="text-body flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] font-black text-white"
            >
              {cancelPending ? "取消中..." : "确认取消"}
            </button>
          </div>
        </DialogCard>
      ) : null}

      {showConfirm ? (
        <DialogCard>
          <h3 className="text-page text-center font-black text-[#27231f]">确认指示</h3>
          <div className="mt-5 space-y-3">
            <SummaryRow label="买入 / 卖出" value={side === "buy" ? "买入" : "卖出"} />
            <SummaryRow label="代号" value={currentProduct.symbol} />
            <SummaryRow label="股数" value={String(displayQuantity)} />
            <SummaryRow label="落盘价" value={currentPriceText} />
            <SummaryRow label="手续费" value={feeText} />
            <SummaryRow label="预计总额" value={totalText} />
          </div>

          <p className="text-label mt-5 text-center text-[#ad957e]">{validityText}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="text-body flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              更改
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitPending}
              className="text-body flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] font-black text-white"
            >
              {submitPending ? "提交中..." : "确定"}
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
          <h3 className="mt-3 text-center text-[18px] font-black text-[#27231f]">提交成功</h3>
          {lastOrderId ? (
            <p className="text-helper mt-2 text-center font-semibold text-[#9c7f61]">
              订单编号 {lastOrderId}
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
              查看交易状况
            </button>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="text-body flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              再次交易
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
              跳至AASTOCKS查看报价
            </button>
            <button
              type="button"
              onClick={closeAll}
              className="text-body flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white font-black text-[var(--app-orange-dark)]"
            >
              返回主页
            </button>
          </div>
        </DialogCard>
      ) : null}
    </div>
  );
}
