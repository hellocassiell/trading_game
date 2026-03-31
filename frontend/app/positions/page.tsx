"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { tradingApiClient } from "../../lib/api";
import { mapPositionsToCards } from "../../lib/adapters/portfolio";
import { byLanguage } from "../../lib/locale";
import { useLanguage } from "../../components/LanguageProvider";

export default function PositionsPage() {
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": {
      title: "交易狀況",
      all: "全部",
      profit: "盈利中",
      filled: "已成交",
      loadError: "讀取持倉失敗",
      retry: "重試",
      empty: "暫無持倉",
      emptyHint: "完成交易後可在此查看持倉",
      price: "現價",
      quantity: "數量",
      avgPrice: "均價",
    },
    "zh-Hans": {
      title: "交易状况",
      all: "全部",
      profit: "盈利中",
      filled: "已成交",
      loadError: "读取持仓失败",
      retry: "重试",
      empty: "暂无持仓",
      emptyHint: "完成交易后可在此查看持仓",
      price: "现价",
      quantity: "数量",
      avgPrice: "均价",
    },
    en: {
      title: "Trading Status",
      all: "All",
      profit: "Profitable",
      filled: "Filled",
      loadError: "Failed to load positions",
      retry: "Retry",
      empty: "No positions yet",
      emptyHint: "Positions appear here after trading",
      price: "Price",
      quantity: "Qty",
      avgPrice: "Avg Price",
    },
  });
  const [positions, setPositions] = useState<Awaited<ReturnType<typeof tradingApiClient.getPositions>>>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoadState("loading");
      try {
        const nextPositions = await tradingApiClient.getPositions();
        if (cancelled) {
          return;
        }
        setPositions(nextPositions);
        setLoadState(nextPositions.length ? "success" : "empty");
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => mapPositionsToCards(positions), [positions]);

  return (
    <AppScreen>
      <ScreenTopBar title={copy.title} showBack backHref="/profile" />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: copy.all, active: true },
            { label: copy.profit },
            { label: copy.filled },
          ]}
        />

        {loadState === "loading" ? (
          <div className="mt-4 space-y-2">
            <div className="state-skeleton h-12 w-full" />
            <div className="state-skeleton h-12 w-full" />
            <div className="state-skeleton h-12 w-full" />
          </div>
        ) : loadState === "error" ? (
          <div className="mt-4 text-center">
            <p className="text-body font-semibold text-[#8f7a66]">{copy.loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mt-3 px-4"
            >
              {copy.retry}
            </button>
          </div>
        ) : loadState === "empty" ? (
          <div className="mt-4 text-center">
            <p className="text-body font-semibold text-[#8f7a66]">{copy.empty}</p>
            <p className="text-helper mt-1 text-[#b39a80]">{copy.emptyHint}</p>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
          {cards.map((item) => (
            <Link
              key={item.symbol}
              href={`/trade/${item.symbol}`}
              className="block rounded-[10px] border border-[#f0e6d8] bg-[#fffcf6] px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-body font-semibold text-[#4f5d73]">
                      {item.symbol}
                    </span>
                    <span className="text-helper text-[#8f7a66]">{item.name}</span>
                  </div>
                  <div className="text-label mt-1.5 grid grid-cols-3 gap-3 text-[#9a8b7a]">
                    <div>
                      <p>{copy.price}</p>
                      <p className="text-helper font-semibold text-[#5f6c80]">
                        {item.currentPrice}
                      </p>
                    </div>
                    <div>
                      <p>{copy.quantity}</p>
                      <p className="text-helper font-semibold text-[#5f6c80]">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p>{copy.avgPrice}</p>
                      <p className="text-helper font-semibold text-[#5f6c80]">
                        {item.averagePrice}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-label">
                  <p className={`rounded-full px-1.5 py-0.5 ${
                    item.positive
                      ? "bg-[#edf8f1] text-[#26b26a]"
                      : "bg-[#fff1ef] text-[#ee5b62]"
                  }`}>
                    {item.pct}
                  </p>
                  <p className="text-helper mt-1 font-semibold text-[#5f6c80]">
                    {item.available}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </SurfaceCard>
    </AppScreen>
  );
}
