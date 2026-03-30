"use client";

import { useEffect, useMemo, useState } from "react";
import AppScreen from "../../components/AppScreen";
import ProfileSummaryCard from "../../components/ProfileSummaryCard";
import { TradeTrigger } from "../../components/TradeModal";
import { tradingApiClient } from "../../lib/api";
import { readAuthSession } from "../../lib/adapters/auth";
import type { AccountAssets, Position } from "../../lib/api";
import {
  mapAccountAssetsToProfileSummary,
  mapPositionsToCards,
} from "../../lib/adapters/portfolio";

function withHkdPrefix(value: string) {
  return `HK$ ${value}`;
}

export default function ProfilePage() {
  const [summary, setSummary] = useState<AccountAssets | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoadState("loading");
      try {
        const [nextSummary, nextPositions] = await Promise.all([
          tradingApiClient.getAccountAssets(),
          tradingApiClient.getPositions(),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(nextSummary);
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
  const summaryView = useMemo(() => {
    if (!summary) {
      return undefined;
    }
    const mapped = mapAccountAssetsToProfileSummary(summary);
    const session = readAuthSession();
    if (session?.nickname) {
      return {
        ...mapped,
        nickname: session.nickname,
      };
    }
    return mapped;
  }, [summary]);

  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+82px)]">
      <div className="min-h-full bg-white">
        <ProfileSummaryCard summary={summaryView} />

        <div className="bg-white px-4 pb-4">
          {loadState === "loading" ? (
            <div className="space-y-3 py-5">
              <div className="state-skeleton h-14 w-full" />
              <div className="state-skeleton h-14 w-full" />
              <div className="state-skeleton h-14 w-full" />
            </div>
          ) : loadState === "error" ? (
            <div className="py-8 text-center">
              <p className="text-body font-semibold text-[#8f7a66]">读取持仓数据失败</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary mt-4 px-4"
              >
                重新载入
              </button>
            </div>
          ) : loadState === "empty" ? (
            <div className="py-8 text-center">
              <p className="text-body font-semibold text-[#8f7a66]">暂无港股持仓</p>
              <p className="text-helper mt-1 text-[#b39a80]">下单后会在这里看到你的港股仓位</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee4d7]">
              {cards.map((item) => (
              <TradeTrigger
                key={item.symbol}
                symbol={item.symbol}
                className="block py-2.5 active:bg-[#fffaf3]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_128px] items-stretch gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 whitespace-nowrap">
                      <p className="text-title font-black leading-none text-[#2e3136]">{item.symbol}</p>
                      <p className="text-body truncate font-bold text-[#40444b]">{item.name}</p>
                    </div>

                    <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-label leading-5">
                      <span className="text-[#9f9589]">持股量</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{item.quantity}</span>
                      <span className="text-[#9f9589]">持股(可交易)</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{item.available}</span>
                      <span className="text-[#9f9589]">平均价</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{withHkdPrefix(item.averagePrice)}</span>
                      <span className="text-[#9f9589]">赚蚀*</span>
                      <span className={`font-black whitespace-nowrap ${item.positive ? "text-[#22b26a]" : "text-[#ee5b62]"}`}>
                        {withHkdPrefix(item.pnl)} ({item.pct})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[16px] bg-[linear-gradient(180deg,#fff9f0,#fff0dd)] px-2.5 py-2.5 text-right shadow-[inset_0_0_0_1px_rgba(241,225,204,0.9)]">
                    <div>
                      <p className="text-label font-semibold text-[#9f9589]">现价</p>
                      <p className={`text-body mt-0.5 whitespace-nowrap font-black leading-none ${item.positive ? "text-[#22b26a]" : "text-[#ee5b62]"}`}>
                        {item.positive ? "▲ " : "▼ "}
                        {withHkdPrefix(item.currentPrice)}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-label font-semibold text-[#9f9589]">参考市值</p>
                      <p className="text-body mt-0.5 whitespace-nowrap font-black leading-none text-[#5a4a39]">
                        {item.referenceMarketValue}
                      </p>
                    </div>
                  </div>
                </div>
              </TradeTrigger>
            ))}
            </div>
          )}

          <p className="text-helper mt-3 text-[#b9a692]">
            更新于 {summary?.updatedAt ?? "—"}
          </p>
          <p className="text-label mt-1 text-[#c4b19b]">* 赚蚀以平均买入价与现价港元估计</p>
        </div>
      </div>
    </AppScreen>
  );
}
