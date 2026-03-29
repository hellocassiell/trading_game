"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { tradingApiClient } from "../../lib/api";
import { mapPositionsToCards } from "../../lib/adapters/portfolio";

export default function PositionsPage() {
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
      <ScreenTopBar title="交易状况" showBack backHref="/profile" />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: "全部", active: true },
            { label: "盈利中" },
            { label: "已成交" },
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
            <p className="text-body font-semibold text-[#8f7a66]">读取持仓失败</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mt-3 px-4"
            >
              重试
            </button>
          </div>
        ) : loadState === "empty" ? (
          <div className="mt-4 text-center">
            <p className="text-body font-semibold text-[#8f7a66]">暂无持仓</p>
            <p className="text-helper mt-1 text-[#b39a80]">完成交易后可在此查看持仓</p>
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
                      <p>现价</p>
                      <p className="text-helper font-semibold text-[#5f6c80]">
                        {item.currentPrice}
                      </p>
                    </div>
                    <div>
                      <p>数量</p>
                      <p className="text-helper font-semibold text-[#5f6c80]">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p>均价</p>
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
