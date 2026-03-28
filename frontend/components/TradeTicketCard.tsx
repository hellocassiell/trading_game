"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
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
  assistantResults,
  getTradeProduct,
  recentSearches,
} from "../lib/mock-data";

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
};

type TradeTicketCardProps = {
  product?: TradeProduct;
  onClose?: () => void;
  variant?: "trade" | "order";
  startWithSearch?: boolean;
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
        className={`w-full max-w-[320px] rounded-[22px] bg-white px-5 py-5 shadow-[0_28px_48px_rgba(36,20,4,0.22)] ${className}`}
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
      <span className="text-[11px] text-[#9b8770]">{label}</span>
      <span className="text-right text-[15px] font-black text-[#2a2723]">{value}</span>
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
  const normalizedQuery = query.trim().toUpperCase();
  const mergedResults = useMemo<SearchResult[]>(() => {
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

    const unique = new Map<string, SearchResult>();
    [...recentItems, ...assistantItems].forEach((item) => {
      if (!unique.has(item.symbol)) {
        unique.set(item.symbol, item);
      }
    });

    return Array.from(unique.values());
  }, []);

  const visibleResults = normalizedQuery
    ? mergedResults.filter((item) => {
        const product = getTradeProduct(item.symbol);
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
        <div className="text-[14px] font-black tracking-[0.04em] text-[#4b3a28]">搜索股票</div>
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
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#4e4338] outline-none placeholder:text-[#c1ab91]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-[11px] font-semibold text-[var(--app-orange-dark)]"
            >
              清除
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] font-black text-[#8f795f]">
            {normalizedQuery ? "搜索结果" : "最近 / 热门"}
          </p>
          <p className="text-[10px] text-[#bfa58a]">{visibleResults.length} 项</p>
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
                    <p className="text-[14px] font-black text-[#2f2b26]">{item.symbol}</p>
                    {item.badge ? (
                      <span className="rounded-full bg-[#fff1de] px-2 py-0.5 text-[9px] font-bold text-[var(--app-orange-dark)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-[12px] text-[#8f7f6f]">
                    {getTradeProduct(item.symbol).company || item.name}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#c8aa85]" />
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] font-black text-[#6b5a48]">找不到匹配股票</p>
              <p className="mt-2 text-[11px] text-[#b39981]">可尝试输入代码、名称或拼音首字母</p>
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
  }, [product, startWithSearch, variant]);

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
  const canSubmit = !!currentProduct && displayPrice > 0 && displayQuantity > 0;
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

  const adjustPrice = (delta: number) => {
    setPrice((current) => Math.max(0.001, Number(((current || 0) + delta).toFixed(3))));
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.max(lotSize, (current || lotSize) + delta * lotSize));
  };

  const openSearch = () => {
    setQuery("");
    setShowSearch(true);
  };

  const handleSearchPick = (symbol: string) => {
    const nextProduct = getTradeProduct(symbol) as TradeProduct;

    setActiveProduct(nextProduct);
    setPrice(parseNumericValue(nextProduct.defaultPrice ?? nextProduct.price));
    setQuantity(parseNumericValue(nextProduct.defaultQuantity ?? nextProduct.lotSize ?? "10"));
    setShowSearch(false);
    setShowConfirm(false);
    setShowSuccess(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setShowSuccess(true);
  };

  const closeAll = () => {
    setShowSuccess(false);
    setShowConfirm(false);
    onClose?.();
    router.push("/");
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
              <div className="flex items-center gap-1 text-[12px] font-bold tracking-[0.04em] text-[#4b3a28]">
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

            <div className="flex items-center justify-between border-t border-[#f1e5d6] px-3.5 py-2.5 text-[10px]">
              <div className="flex items-center gap-2 font-semibold text-[#504030]">
                <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#fff1de] text-[var(--app-orange-dark)]">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
                <span>智财港股投资大赛2020</span>
              </div>
              <span className="font-semibold text-[#7b6450]">由 Citi 赞助</span>
            </div>

            <div className="bg-[#5e6670] px-3.5 py-2 text-[9.5px] leading-relaxed text-white">
              要维持有效的参赛资格，请记得每週最少成功交易4次，加油!
            </div>
          </header>

          <main className="bg-white">
            <section className="grid grid-cols-2 border-b border-[#efe5d8] px-3.5 py-2.5 text-[10px]">
              <div>
                <p className="text-[#907a63]">今日尚馀交易次数</p>
                <p className="mt-1 text-[14px] font-bold text-[#25282d]">{tradesLeft}</p>
              </div>
              <div className="text-right">
                <p className="text-[#907a63]">可动用投资金额</p>
                <p className="mt-1 text-[14px] font-bold text-[#25282d]">{availableCash}</p>
              </div>
            </section>

            <section className="border-b border-[#efe5d8] px-3.5 py-3">
              <button
                type="button"
                onClick={openSearch}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#f3dcc0] bg-[#fffaf3] px-3 py-2.5 text-left active:bg-[#fff3e3]"
              >
                <div className="flex items-center gap-1 text-[10.5px] font-semibold text-[#5d4b3d]">
                  <span>可买卖股票</span>
                  <Info className="h-3.5 w-3.5 text-[#c59b6e]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#32271e]">
                  <Search className="h-4 w-4 text-[#c59b6e]" />
                  <span>{currentProduct.symbol}</span>
                </div>
              </button>

              <div className="relative mt-3 overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(255,193,126,0.14),transparent_58%)] py-4 text-center">
                {variant === "order" ? (
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.06em] text-[var(--app-orange-dark)]">
                    更改订单
                  </p>
                ) : null}
                <p className="px-4 text-[17px] font-black text-[#1f2328]">{currentProduct.company}</p>
                <div className={`mt-2 flex items-end justify-center gap-1.5 ${changeTone}`}>
                  <span className="text-[13px] leading-none">{changeArrow}</span>
                  <span className="text-[18px] font-black leading-none">{formatNumber(quoteValue || displayPrice)}</span>
                  <span className="text-[11px] font-semibold leading-none">
                    {formatNumber(Math.abs(priceChangeValue))} ({changePct})
                  </span>
                </div>
                <p className="mt-1 text-[9px] text-[#baa28b]">
                  港股即时报价 2021/04/21 11:00 HKT
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    router.push("/quotes");
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--app-orange-dark)]"
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
                  className={`flex h-10 items-center justify-center rounded-[12px] border text-[12px] font-bold transition-all ${
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
                  className={`flex h-10 items-center justify-center rounded-[12px] border text-[12px] font-bold transition-all ${
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
                <span className="text-[10.5px] text-[#907a63]">报价({currencyUnit})</span>
                <button
                  type="button"
                  onClick={() => adjustPrice(-0.1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-center text-[16px] font-bold text-[#23262b]">
                  {formatNumber(displayPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => adjustPrice(0.1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-right text-[9.5px] text-[#bc9871]">最小变动 0.1</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 py-3">
                <span className="text-[10.5px] text-[#907a63]">股数</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-center text-[16px] font-bold text-[#23262b]">
                  {displayQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-orange)] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-right text-[9.5px] text-[#bc9871]">每手 {lotSize} 股</span>
              </div>
            </section>
          </main>

          <footer className="border-t border-[#efe5d8] bg-white px-3.5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
            <div className="flex items-end justify-between">
              <span className="text-[10.5px] font-semibold text-[#6a594b]">预计总额 (含手续费)</span>
              <div className="text-right">
                <p className="text-[17px] font-black text-[#23262b]">{totalText}</p>
                <p className="mt-0.5 text-[9px] text-[#b5a08a]">{feeText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`mt-3 flex h-12 w-full items-center justify-center rounded-[18px] text-[15px] font-bold transition-all active:scale-[0.98] ${
                canSubmit
                  ? "bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] text-white shadow-[0_10px_24px_rgba(255,140,26,0.24)]"
                  : "bg-[#ecd5bd] text-white"
              }`}
            >
              {variant === "order" ? "提交修改" : "提交"}
            </button>
            <p className="pt-1.5 text-center text-[9px] text-[#b5a08a]">(此为比赛交易)</p>
          </footer>
        </div>
      ) : null}

      {showDetails ? (
        <DialogCard>
          <h3 className="text-center text-[18px] font-black text-[#27231f]">交易详情</h3>
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
              className="flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              更改订单
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] text-[14px] font-black text-white"
            >
              取消订单
            </button>
          </div>
        </DialogCard>
      ) : null}

      {showConfirm ? (
        <DialogCard>
          <h3 className="text-center text-[18px] font-black text-[#27231f]">确认指示</h3>
          <div className="mt-5 space-y-3">
            <SummaryRow label="买入 / 卖出" value={side === "buy" ? "买入" : "卖出"} />
            <SummaryRow label="代号" value={currentProduct.symbol} />
            <SummaryRow label="股数" value={String(displayQuantity)} />
            <SummaryRow label="落盘价" value={currentPriceText} />
            <SummaryRow label="手续费" value={feeText} />
            <SummaryRow label="预计总额" value={totalText} />
          </div>

          <p className="mt-5 text-center text-[10px] text-[#ad957e]">{validityText}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex h-11 items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              更改
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] text-[14px] font-black text-white"
            >
              确定
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

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                onClose?.();
                router.push("/records");
              }}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              查看交易状况
            </button>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              再次交易
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                onClose?.();
                router.push("/quotes");
              }}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              跳至AASTOCKS查看报价
            </button>
            <button
              type="button"
              onClick={closeAll}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#ffbe78] bg-white text-[14px] font-black text-[var(--app-orange-dark)]"
            >
              返回主页
            </button>
          </div>
        </DialogCard>
      ) : null}
    </div>
  );
}
