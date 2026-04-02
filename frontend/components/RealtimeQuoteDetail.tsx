"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import AppScreen from "./AppScreen";
import { tradingApiClient } from "../lib/api";
import type { QuoteDepthLevel, TradeQuoteSnapshot, TradeQuoteStreamPayload, ViewStatus } from "../lib/api/types";
import { useLanguage } from "./LanguageProvider";
import { getRealtimeQuoteCopy } from "../lib/adapters/realtime-quote-copy";

type RealtimeQuoteDetailProps = {
  symbol: string;
};

type ConnectionState = "connecting" | "live" | "disconnected";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/\.HK$/, "");
}

function formatPrice(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(3);
}

function formatVolume(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toLocaleString("en-US");
}

function mergeSnapshot(prev: TradeQuoteSnapshot, stream: TradeQuoteStreamPayload): TradeQuoteSnapshot {
  const nextPrice =
    typeof stream.nominalPrice === "number"
      ? stream.nominalPrice
      : typeof stream.lastPrice === "number"
      ? stream.lastPrice
      : prev.currentPrice;
  const changeAmount = Number((nextPrice - prev.prevClose).toFixed(2));
  const changePercent =
    prev.prevClose === 0 ? 0 : Number((((nextPrice - prev.prevClose) / prev.prevClose) * 100).toFixed(2));
  const bids = stream.bids && stream.bids.length > 0 ? stream.bids : prev.orderBook.bids;
  const asks = stream.asks && stream.asks.length > 0 ? stream.asks : prev.orderBook.asks;

  return {
    ...prev,
    currentPrice: nextPrice,
    changeAmount,
    changePercent,
    bidPrice: bids[0]?.price ?? prev.bidPrice,
    askPrice: asks[0]?.price ?? prev.askPrice,
    updatedAt: stream.updatedAt ?? prev.updatedAt,
    source: "REALTIME",
    orderBook: {
      bids,
      asks,
      sequence: stream.sequence ?? prev.orderBook.sequence,
    },
  };
}

function DepthRows({
  title,
  side,
  levels,
}: {
  title: string;
  side: "BID" | "ASK";
  levels: QuoteDepthLevel[];
}) {
  const maxVolume = useMemo(() => Math.max(1, ...levels.map((item) => item.volume || 0)), [levels]);
  return (
    <div className="rounded-[16px] border border-[#f1ddc5] bg-white p-3">
      <p className="text-[11px] font-black text-[#8f7758]">{title}</p>
      <div className="mt-2 space-y-1.5">
        {levels.slice(0, 5).map((level, index) => {
          const width = `${Math.max(6, Math.round((level.volume / maxVolume) * 100))}%`;
          return (
            <div key={`${side}-${index}-${level.price}-${level.volume}`} className="relative overflow-hidden rounded-[10px] border border-[#f8ebdb] px-2 py-1.5">
              <div
                className={`absolute inset-y-0 left-0 ${
                  side === "BID" ? "bg-[#e7f8ee]" : "bg-[#fff1e8]"
                }`}
                style={{ width }}
              />
              <div className="relative grid grid-cols-[1fr_auto] items-center gap-2 text-[11px]">
                <span className={`font-black ${side === "BID" ? "text-[#0f9d58]" : "text-[#e65100]"}`}>
                  {formatPrice(level.price)}
                </span>
                <span className="font-semibold text-[#6e5b45]">{formatVolume(level.volume)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RealtimeQuoteDetail({ symbol }: RealtimeQuoteDetailProps) {
  const { language } = useLanguage();
  const copy = getRealtimeQuoteCopy(language);
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [quote, setQuote] = useState<TradeQuoteSnapshot | null>(null);
  const normalizedSymbol = normalizeSymbol(symbol);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | null = null;
    const bootstrap = async () => {
      try {
        setStatus("loading");
        const snapshot = await tradingApiClient.getTradeQuote(normalizedSymbol);
        if (disposed) {
          return;
        }
        setQuote(snapshot);
        setStatus("success");
        setErrorMessage("");
      } catch (error) {
        if (disposed) {
          return;
        }
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : copy.loadErrorFallback);
      }

      unsubscribe = tradingApiClient.subscribeTradeQuote(normalizedSymbol, {
        onMessage: (payload: TradeQuoteStreamPayload) => {
          setConnection("live");
          setQuote((prev) => {
            if (!prev) {
              return prev;
            }
            return mergeSnapshot(prev, payload);
          });
        },
        onError: () => {
          setConnection("disconnected");
        },
      });
    };

    bootstrap();
    return () => {
      disposed = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [normalizedSymbol, copy.loadErrorFallback]);

  return (
    <AppScreen className="!px-3 !pb-4">
      <div className="space-y-3">
        <div className="rounded-[18px] bg-[linear-gradient(165deg,#fff4e5,#ffe9cb)] p-3 shadow-[0_14px_28px_rgba(220,111,0,0.14)]">
          <div className="flex items-center justify-between">
            <Link
              href={`/trade/${normalizedSymbol}`}
              className="flex items-center gap-1 rounded-full bg-white/75 px-2 py-1 text-[11px] font-black text-[#8c5a25]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {copy.back}
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8d6f4d]">
              {connection === "live" ? <Wifi className="h-3.5 w-3.5 text-[#0f9d58]" /> : <WifiOff className="h-3.5 w-3.5 text-[#c06b28]" />}
              {connection === "live"
                ? copy.connection.live
                : connection === "connecting"
                  ? copy.connection.connecting
                  : copy.connection.disconnected}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-black text-[#8f7758]">{normalizedSymbol}</p>
            <p className="mt-1 text-[18px] font-black text-[#2d241a]">{quote?.stockName ?? copy.loadingName}</p>
          </div>

          <div className="mt-2 flex items-end justify-between">
            <p className={`text-[32px] font-black ${(quote?.changeAmount ?? 0) >= 0 ? "text-[#e65100]" : "text-[#0f9d58]"}`}>
              {quote ? formatPrice(quote.currentPrice) : "--"}
            </p>
            <div className="text-right">
              <p className={`text-[12px] font-black ${(quote?.changeAmount ?? 0) >= 0 ? "text-[#e65100]" : "text-[#0f9d58]"}`}>
                {quote ? `${quote.changeAmount >= 0 ? "+" : ""}${quote.changeAmount} (${quote.changePercent}%)` : "--"}
              </p>
              <p className="text-[10px] text-[#9b8164]">{copy.updatedAtPrefix} {quote?.updatedAt ?? "--"}</p>
            </div>
          </div>
        </div>

        {status === "loading" ? (
          <div className="rounded-[16px] border border-[#f1dec8] bg-white px-4 py-8 text-center text-[12px] text-[#8f795f]">{copy.loading}</div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-[16px] border border-[#f4d8c6] bg-[#fff6f1] px-4 py-6 text-center">
            <p className="text-[12px] font-black text-[#b04a00]">{copy.loadErrorTitle}</p>
            <p className="mt-1 text-[11px] text-[#9b785d]">{errorMessage}</p>
          </div>
        ) : null}

        {status === "success" && quote ? (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <DepthRows title={copy.bidDepthTitle} side="BID" levels={quote.orderBook.bids} />
              <DepthRows title={copy.askDepthTitle} side="ASK" levels={quote.orderBook.asks} />
            </div>

            <div className="rounded-[16px] border border-[#f1ddc5] bg-white p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#8f7758]">
                <Activity className="h-3.5 w-3.5 text-[#d87410]" />
                {copy.marketNoteTitle}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#6e5b45]">
                {copy.marketNoteBody}
              </p>
              <div className="mt-2 text-[10px] text-[#9a8368]">
                {copy.sourcePrefix}：{quote.source} / {copy.sequencePrefix}：{quote.orderBook.sequence}
              </div>
            </div>
          </>
        ) : null}

        {status === "success" && quote && quote.orderBook.bids.length === 0 && quote.orderBook.asks.length === 0 ? (
          <div className="rounded-[16px] border border-[#f2e2cf] bg-[#fffaf4] px-4 py-6 text-center">
            <p className="text-[12px] font-black text-[#8f7758]">{copy.emptyDepthTitle}</p>
            <p className="mt-1 text-[10px] text-[#a28769]">{copy.emptyDepthHint}</p>
          </div>
        ) : null}
      </div>
    </AppScreen>
  );
}
