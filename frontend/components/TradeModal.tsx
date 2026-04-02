"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import TradeTicketCard from "./TradeTicketCard";
import { byLanguage } from "../lib/locale";
import { useLanguage } from "./LanguageProvider";
import type { TradeOrderDetail } from "../lib/api";

type TradeModalVariant = "trade" | "order";

type TradeModalState = {
  symbol?: string | null;
  variant: TradeModalVariant;
  orderId?: string;
  orderStatus?: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED";
  orderDetail?: Pick<TradeOrderDetail, "direction" | "price" | "quantity">;
} | null;

type TradeModalContextValue = {
  openTrade: (
    symbol?: string | null,
    variant?: TradeModalVariant,
    orderId?: string,
    orderStatus?: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED",
    orderDetail?: Pick<TradeOrderDetail, "direction" | "price" | "quantity">
  ) => void;
  closeTrade: () => void;
};

const TradeModalContext = createContext<TradeModalContextValue | null>(null);

export function TradeModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TradeModalState>(null);
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": { closeTradeModal: "關閉交易彈窗" },
    "zh-Hans": { closeTradeModal: "关闭交易弹窗" },
    en: { closeTradeModal: "Close trade modal" },
  });

  const value = useMemo<TradeModalContextValue>(
    () => ({
      openTrade: (symbol, variant = "trade", orderId, orderStatus, orderDetail) =>
        setState({ symbol, variant, orderId, orderStatus, orderDetail }),
      closeTrade: () => setState(null),
    }),
    []
  );

  return (
    <TradeModalContext.Provider value={value}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(40,24,8,0.34)]">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={copy.closeTradeModal}
            onClick={() => setState(null)}
          />

          <div className="relative z-10 w-full pb-0">
            <TradeTicketCard
              symbol={state.symbol ?? undefined}
              variant={state.variant}
              orderId={state.orderId}
              orderStatus={state.orderStatus}
              orderDetail={state.orderDetail}
              startWithSearch={!state.symbol}
              onClose={() => setState(null)}
            />
          </div>
        </div>
      ) : null}
    </TradeModalContext.Provider>
  );
}

export function useTradeModal() {
  const context = useContext(TradeModalContext);

  if (!context) {
    throw new Error("useTradeModal must be used within a TradeModalProvider");
  }

  return context;
}

type TradeTriggerProps = {
  symbol?: string;
  variant?: TradeModalVariant;
  orderId?: string;
  orderStatus?: "PENDING" | "PARTIAL_FILLED" | "FILLED" | "CANCELED" | "REJECTED";
  orderDetail?: Pick<TradeOrderDetail, "direction" | "price" | "quantity">;
  className?: string;
  children: ReactNode;
};

export function TradeTrigger({
  symbol,
  variant = "trade",
  orderId,
  orderStatus,
  orderDetail,
  className = "",
  children,
}: TradeTriggerProps) {
  const { openTrade } = useTradeModal();

  return (
    <button
      type="button"
      onClick={() => openTrade(symbol, variant, orderId, orderStatus, orderDetail)}
      className={className}
    >
      {children}
    </button>
  );
}
