"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { TradeTrigger } from "../../../components/TradeModal";
import { useLanguage } from "../../../components/LanguageProvider";
import { tradingApiClient } from "../../../lib/api";
import {
  buildQuoteDetailMockKline,
  buildQuoteDetailMockOrderBook,
  type QuoteDetailMockCandle,
  type QuoteDetailOrderBook,
} from "../../../lib/adapters/quote-detail";
import { byLanguage } from "../../../lib/locale";

type QuoteData = {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  turnover: number;
  timestamp: string;
  lotSize: number;
};

function formatPrice(price: number) {
  return price.toFixed(3);
}

function formatCompactNumber(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }
  return Math.round(value).toLocaleString("en-US");
}

function formatTurnover(turnover: number) {
  return `HK$ ${formatCompactNumber(turnover)}`;
}

function formatSignedPrice(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatPrice(value)}`;
}

function formatSignedPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function buildQuoteLink(stockCode: string) {
  return `https://www.aastocks.com/tc/stocks/quote/detail-quote.aspx?symbol=${encodeURIComponent(
    stockCode
  )}`;
}

function getPriceTone(current: number, reference: number) {
  if (current > reference) {
    return "text-[var(--app-orange-dark)]";
  }
  if (current < reference) {
    return "text-[#169b55]";
  }
  return "text-[#2a1b12]";
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const symbol = params?.symbol as string;

  const copy = byLanguage(language, {
    "zh-Hant": {
      marketTitle: "港股即時報價",
      currentPrice: "現價",
      open: "今開",
      high: "最高",
      low: "最低",
      prevClose: "昨收",
      volume: "成交量",
      turnover: "成交額",
      lotSize: "每手股數",
      updatedAt: "更新時間",
      bid: "買盤",
      ask: "賣盤",
      price: "價格",
      quantity: "數量",
      kline: "日 K 走勢",
      klineHint: "示意行情數據，版面按正式報價頁呈現",
      trade: "立即交易",
      loading: "載入中...",
      error: "載入失敗",
      viewOnAastocks: "AASTOCKS",
      boardDepth: "買賣盤",
      chartTabMain: "1D",
      chartTabAltOne: "1W",
      chartTabAltTwo: "1M",
      lotUnit: "股",
      hkt: "HKT",
    },
    "zh-Hans": {
      marketTitle: "港股即时报价",
      currentPrice: "现价",
      open: "今开",
      high: "最高",
      low: "最低",
      prevClose: "昨收",
      volume: "成交量",
      turnover: "成交额",
      lotSize: "每手股数",
      updatedAt: "更新时间",
      bid: "买盘",
      ask: "卖盘",
      price: "价格",
      quantity: "数量",
      kline: "日 K 走势",
      klineHint: "示意行情数据，版面按正式报价页呈现",
      trade: "立即交易",
      loading: "载入中...",
      error: "载入失败",
      viewOnAastocks: "AASTOCKS",
      boardDepth: "买卖盘",
      chartTabMain: "1D",
      chartTabAltOne: "1W",
      chartTabAltTwo: "1M",
      lotUnit: "股",
      hkt: "HKT",
    },
    en: {
      marketTitle: "HK Live Quote",
      currentPrice: "Last",
      open: "Open",
      high: "High",
      low: "Low",
      prevClose: "Prev Close",
      volume: "Volume",
      turnover: "Turnover",
      lotSize: "Lot Size",
      updatedAt: "Updated",
      bid: "Bid",
      ask: "Ask",
      price: "Price",
      quantity: "Qty",
      kline: "Daily Candles",
      klineHint: "Mock market data with a production-style chart layout",
      trade: "Trade Now",
      loading: "Loading...",
      error: "Failed to load",
      viewOnAastocks: "AASTOCKS",
      boardDepth: "Order Book",
      chartTabMain: "1D",
      chartTabAltOne: "1W",
      chartTabAltTwo: "1M",
      lotUnit: "shares",
      hkt: "HKT",
    },
  });

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [orderBook, setOrderBook] = useState<QuoteDetailOrderBook | null>(null);
  const [klineData, setKlineData] = useState<QuoteDetailMockCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!symbol) {
      return;
    }

    let cancelled = false;

    async function loadQuoteData() {
      setLoading(true);
      setError(false);

      try {
        const stockInfo = await tradingApiClient.searchTradeTargets(symbol);
        const stock = stockInfo.items.find((item) => item.stockCode === symbol) ?? stockInfo.items[0];

        if (!stock) {
          throw new Error("Stock not found");
        }

        const currentPrice = stock.currentPrice || 100;
        const changeAmount = stock.changeAmount || 0;
        const changePercent = stock.changePercent || 0;
        const prevClose = currentPrice - changeAmount || currentPrice * 0.99;
        const open = prevClose * (1 + ((stock.stockCode.charCodeAt(0) % 7) - 3) * 0.0018);
        const intradayHigh = Math.max(currentPrice, open, prevClose) * 1.0065;
        const intradayLow = Math.min(currentPrice, open, prevClose) * 0.9945;
        const volume = 15230000 + (stock.stockCode.charCodeAt(stock.stockCode.length - 1) % 7) * 560000;
        const turnover = volume * currentPrice;

        const nextQuote: QuoteData = {
          stockCode: stock.stockCode,
          stockName: stock.stockName,
          currentPrice,
          changeAmount,
          changePercent,
          open,
          high: intradayHigh,
          low: intradayLow,
          prevClose,
          volume,
          turnover,
          timestamp: new Date().toISOString(),
          lotSize: stock.lotSize || 100,
        };

        if (!cancelled) {
          setQuoteData(nextQuote);
          setOrderBook(buildQuoteDetailMockOrderBook(stock.stockCode, currentPrice));
          setKlineData(buildQuoteDetailMockKline(stock.stockCode, currentPrice));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    void loadQuoteData();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const chartMetrics = useMemo(() => {
    if (klineData.length === 0) {
      return null;
    }

    const highs = klineData.map((item) => item.high);
    const lows = klineData.map((item) => item.low);
    const volumes = klineData.map((item) => item.volume);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const priceRange = Math.max(maxPrice - minPrice, 0.001);
    const maxVolume = Math.max(...volumes, 1);

    return {
      minPrice,
      maxPrice,
      priceRange,
      maxVolume,
      priceLabels: [
        maxPrice,
        maxPrice - priceRange / 3,
        maxPrice - (priceRange / 3) * 2,
        minPrice,
      ],
    };
  }, [klineData]);

  if (loading) {
    return (
      <AppScreen>
        <div className="flex h-screen items-center justify-center">
          <p className="text-body text-[#8f7f6f]">{copy.loading}</p>
        </div>
      </AppScreen>
    );
  }

  if (error || !quoteData || !chartMetrics || !orderBook) {
    return (
      <AppScreen>
        <div className="flex h-screen items-center justify-center">
          <p className="text-body text-[#ef4444]">{copy.error}</p>
        </div>
      </AppScreen>
    );
  }

  const isPositive = quoteData.changeAmount >= 0;
  const priceTone = getPriceTone(quoteData.currentPrice, quoteData.prevClose);
  const changeTone = isPositive ? "text-[var(--app-orange-dark)]" : "text-[#169b55]";
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const orderBookMaxQuantity = Math.max(
    ...orderBook.bids.map((item) => item.quantity),
    ...orderBook.asks.map((item) => item.quantity),
    1
  );
  const chartWidth = Math.max(340, klineData.length * 18 + 72);
  const chartHeight = 246;
  const chartTop = 22;
  const chartBottom = 144;
  const volumeBottom = 206;
  const volumeTop = 154;
  const quoteLink = buildQuoteLink(quoteData.stockCode);

  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <div className="min-h-[100dvh] bg-[#fff6ee]">
        <div className="sticky top-0 z-20 overflow-hidden bg-[linear-gradient(180deg,#ffbc6d_0%,#f08a16_62%,#da7100_100%)] px-4 pb-5 pt-[max(env(safe-area-inset-top),12px)] text-white shadow-[0_14px_34px_rgba(171,86,0,0.18)]">
          <div className="pointer-events-none absolute right-[-18px] top-4 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute left-[-24px] bottom-[-30px] h-24 w-24 rounded-full bg-[#ffd497]/18" />

          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/16 active:bg-white/22"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-[12px] font-black tracking-[0.16em] text-white/88">
              {copy.marketTitle}
            </p>
            <Link
              href={quoteLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-full bg-white/16 px-3 text-[11px] font-black tracking-[0.08em] text-white active:bg-white/22"
            >
              {copy.viewOnAastocks}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[32px] font-black leading-none">{quoteData.stockCode}</p>
              <p className="mt-1 truncate text-[14px] font-semibold text-white/92">
                {quoteData.stockName}
              </p>
              <p className="mt-2 text-[11px] font-medium tracking-[0.08em] text-[#fff0d2]">
                {copy.lotSize} {quoteData.lotSize.toLocaleString("en-US")} {copy.lotUnit}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[38px] font-black leading-none text-[#fff7e7]">
                {formatPrice(quoteData.currentPrice)}
              </p>
              <div className={`mt-2 inline-flex items-center gap-1.5 ${changeTone}`}>
                <ChangeIcon className="h-4.5 w-4.5" />
                <span className="text-[14px] font-black">
                  {formatSignedPrice(quoteData.changeAmount)}
                </span>
                <span className="text-[14px] font-black">
                  {formatSignedPercent(quoteData.changePercent)}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium tracking-[0.08em] text-[#fff0d2]">
                {copy.updatedAt} {quoteData.timestamp.slice(11, 16)} {copy.hkt}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 pb-6 pt-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-[16px] border border-[#f3dcc0] bg-white px-3 py-3 shadow-[0_10px_20px_rgba(171,86,0,0.05)]">
              <p className="text-[11px] font-semibold text-[#9f8f7f]">{copy.volume}</p>
              <p className="mt-1 text-[16px] font-black text-[#2a1b12]">
                {formatCompactNumber(quoteData.volume)}
              </p>
            </div>
            <div className="rounded-[16px] border border-[#f3dcc0] bg-white px-3 py-3 shadow-[0_10px_20px_rgba(171,86,0,0.05)]">
              <p className="text-[11px] font-semibold text-[#9f8f7f]">{copy.turnover}</p>
              <p className="mt-1 text-[16px] font-black text-[#2a1b12]">
                {formatCompactNumber(quoteData.turnover)}
              </p>
            </div>
            <div className="rounded-[16px] border border-[#f3dcc0] bg-white px-3 py-3 shadow-[0_10px_20px_rgba(171,86,0,0.05)]">
              <p className="text-[11px] font-semibold text-[#9f8f7f]">{copy.prevClose}</p>
              <p className="mt-1 text-[16px] font-black text-[#2a1b12]">
                {formatPrice(quoteData.prevClose)}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#f1dcc3] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(171,86,0,0.06)]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: copy.currentPrice, value: formatPrice(quoteData.currentPrice), tone: priceTone },
                { label: copy.open, value: formatPrice(quoteData.open), tone: getPriceTone(quoteData.open, quoteData.prevClose) },
                { label: copy.high, value: formatPrice(quoteData.high), tone: "text-[var(--app-orange-dark)]" },
                { label: copy.low, value: formatPrice(quoteData.low), tone: "text-[#169b55]" },
                { label: copy.turnover, value: formatTurnover(quoteData.turnover), tone: "text-[#2a1b12]" },
                {
                  label: copy.lotSize,
                  value: `${quoteData.lotSize.toLocaleString("en-US")} ${copy.lotUnit}`,
                  tone: "text-[#2a1b12]",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[16px] bg-[linear-gradient(180deg,#fffaf4_0%,#fff4e8_100%)] px-3 py-3">
                  <p className="text-[11px] font-semibold text-[#9f8f7f]">{item.label}</p>
                  <p className={`mt-1 text-[17px] font-black ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#f1dcc3] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(171,86,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[18px] font-black text-[#23170e]">{copy.kline}</p>
                <p className="mt-1 text-[11px] font-medium text-[#9f8a74]">{copy.klineHint}</p>
              </div>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-[#ffedd6] px-3 py-1 text-[11px] font-black text-[var(--app-orange-dark)]">
                  {copy.chartTabMain}
                </span>
                <span className="rounded-full bg-[#f5eee5] px-3 py-1 text-[11px] font-semibold text-[#a18b72]">
                  {copy.chartTabAltOne}
                </span>
                <span className="rounded-full bg-[#f5eee5] px-3 py-1 text-[11px] font-semibold text-[#a18b72]">
                  {copy.chartTabAltTwo}
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg
                width={chartWidth}
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="rounded-[16px] bg-[linear-gradient(180deg,#fffaf4_0%,#fffdfb_100%)]"
              >
                {[0, 1, 2, 3].map((index) => {
                  const y = chartTop + ((chartBottom - chartTop) / 3) * index;
                  return (
                    <g key={index}>
                      <line
                        x1="40"
                        y1={y}
                        x2={chartWidth - 16}
                        y2={y}
                        stroke="#efdfcf"
                        strokeDasharray="3 4"
                      />
                      <text
                        x={chartWidth - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#a28d73"
                      >
                        {formatPrice(chartMetrics.priceLabels[index])}
                      </text>
                    </g>
                  );
                })}

                <line x1="40" y1={chartTop - 8} x2="40" y2={chartBottom} stroke="#ead8c3" />
                <line x1="40" y1={chartBottom} x2={chartWidth - 16} y2={chartBottom} stroke="#ead8c3" />

                {klineData.map((candle, index) => {
                  const candleX = 52 + index * 12;
                  const wickX = candleX + 4;
                  const openY =
                    chartBottom - ((candle.open - chartMetrics.minPrice) / chartMetrics.priceRange) * (chartBottom - chartTop);
                  const closeY =
                    chartBottom - ((candle.close - chartMetrics.minPrice) / chartMetrics.priceRange) * (chartBottom - chartTop);
                  const highY =
                    chartBottom - ((candle.high - chartMetrics.minPrice) / chartMetrics.priceRange) * (chartBottom - chartTop);
                  const lowY =
                    chartBottom - ((candle.low - chartMetrics.minPrice) / chartMetrics.priceRange) * (chartBottom - chartTop);
                  const volumeHeight =
                    (candle.volume / chartMetrics.maxVolume) * (volumeBottom - volumeTop);
                  const isUp = candle.close >= candle.open;
                  const bodyFill = isUp ? "#f08a16" : "#2eb568";
                  const wickStroke = isUp ? "#da7100" : "#169b55";

                  return (
                    <g key={candle.time}>
                      <line x1={wickX} y1={highY} x2={wickX} y2={lowY} stroke={wickStroke} strokeWidth="1.2" />
                      <rect
                        x={candleX}
                        y={Math.min(openY, closeY)}
                        width="8"
                        height={Math.max(Math.abs(closeY - openY), 2)}
                        rx="1.5"
                        fill={bodyFill}
                      />
                      <rect
                        x={candleX + 1}
                        y={volumeBottom - volumeHeight}
                        width="6"
                        height={Math.max(volumeHeight, 2)}
                        rx="1.5"
                        fill={isUp ? "#ffd59a" : "#b8e4c8"}
                      />
                    </g>
                  );
                })}

                {klineData.filter((_, index) => index % 6 === 0).map((candle, index) => (
                  <text
                    key={`${candle.time}-label`}
                    x={56 + index * 72}
                    y={chartHeight - 10}
                    fontSize="10"
                    fill="#a28d73"
                    textAnchor="middle"
                  >
                    {candle.time}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#f1dcc3] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(171,86,0,0.06)]">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--app-orange)]" />
              <p className="text-[17px] font-black text-[#23170e]">{copy.boardDepth}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: copy.bid, rows: orderBook.bids, priceTone: "text-[var(--app-orange-dark)]", barTone: "bg-[#ffd9a7]" },
                { title: copy.ask, rows: orderBook.asks, priceTone: "text-[#169b55]", barTone: "bg-[#cfead8]" },
              ].map((section) => (
                <div key={section.title}>
                  <div className="mb-2 grid grid-cols-[1fr_auto] text-[11px] font-semibold text-[#9f8f7f]">
                    <span>{copy.price}</span>
                    <span>{copy.quantity}</span>
                  </div>
                  <div className="space-y-2">
                    {section.rows.map((row, index) => (
                      <div key={`${section.title}-${index}`} className="relative overflow-hidden rounded-[12px] bg-[#fffaf4] px-3 py-2">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-[12px] ${section.barTone}`}
                          style={{ width: `${(row.quantity / orderBookMaxQuantity) * 100}%`, opacity: 0.55 }}
                        />
                        <div className="relative grid grid-cols-[1fr_auto] items-center gap-2">
                          <span className={`text-[13px] font-black ${section.priceTone}`}>
                            {formatPrice(row.price)}
                          </span>
                          <span className="text-[13px] font-semibold text-[#2a1b12]">
                            {formatCompactNumber(row.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-white/96 px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-3 shadow-[0_-8px_20px_rgba(171,86,0,0.08)] backdrop-blur">
          <TradeTrigger symbol={quoteData.stockCode}>
            <div className="w-full rounded-[18px] bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] py-4 text-center text-[16px] font-black tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(255,140,26,0.24)] active:scale-[0.98]">
              {copy.trade}
            </div>
          </TradeTrigger>
        </div>
      </div>
    </AppScreen>
  );
}
