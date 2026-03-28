"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import TradeTicketCard from "./TradeTicketCard";
import { getTradeProductViewModel } from "../lib/adapters/trade";

type TradeModalVariant = "trade" | "order";

type TradeModalState = {
  symbol?: string | null;
  variant: TradeModalVariant;
} | null;

type TradeModalContextValue = {
  openTrade: (symbol?: string | null, variant?: TradeModalVariant) => void;
  closeTrade: () => void;
};

const TradeModalContext = createContext<TradeModalContextValue | null>(null);

export function TradeModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TradeModalState>(null);

  const value = useMemo<TradeModalContextValue>(
    () => ({
      openTrade: (symbol, variant = "trade") => setState({ symbol, variant }),
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
            aria-label="关闭交易弹窗"
            onClick={() => setState(null)}
          />

          <div className="relative z-10 w-full pb-0">
            <TradeTicketCard
              product={state.symbol ? getTradeProductViewModel(state.symbol) : undefined}
              variant={state.variant}
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
  className?: string;
  children: ReactNode;
};

export function TradeTrigger({
  symbol,
  variant = "trade",
  className = "",
  children,
}: TradeTriggerProps) {
  const { openTrade } = useTradeModal();

  return (
    <button
      type="button"
      onClick={() => openTrade(symbol, variant)}
      className={className}
    >
      {children}
    </button>
  );
}
