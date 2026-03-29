"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { TradeTrigger } from "../../../components/TradeModal";
import { getTopVolumePageData } from "../../../lib/adapters/ranking";

const tabs = [
  { key: "buy", label: "10大买入" },
  { key: "sell", label: "10大卖出" },
] as const;

export default function TopVolumePage() {
  const { status, buyRows, sellRows, updatedAt } = getTopVolumePageData();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const rows = activeTab === "buy" ? buyRows : sellRows;

  if (status === "error") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-page font-black text-[#2a1b12]">成交榜单加载失败</p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen className="!px-0">
      <div className="min-h-full overflow-hidden bg-white">
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffb85f_0%,#ff9523_58%,#db7400_100%)] px-4 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_12px_28px_rgba(171,86,0,0.14)]">
          <div className="flex items-center gap-1 pb-4">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label="返回"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-page font-black">今日10大成交港股</h1>
          </div>

          <div className="grid grid-cols-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-title relative flex h-12 items-center justify-center font-black transition-colors ${
                    isActive ? "text-[#ffe26e]" : "text-[#ffd59a]"
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute bottom-0 h-[3px] w-20 rounded-full bg-[#ffe26e]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-helper grid grid-cols-[1fr_auto] items-center border-b border-[#efe4d7] px-4 py-2.5 font-semibold text-[#b5a190]">
          <span>代號及名稱</span>
          <span>{activeTab === "buy" ? "總買入金額" : "總賣出金額"}</span>
        </div>

        <div className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute bottom-[-30px] right-[-26px] text-[180px] font-black leading-none tracking-[-0.08em] text-[#fff4e6]">
            AA
          </div>

          <div className="relative">
            {rows.map((item) => (
              <TradeTrigger
                key={`${activeTab}-${item.symbol}`}
                symbol={item.symbol}
                className="grid min-h-[56px] w-full grid-cols-[1fr_auto] items-center border-b border-[#f0e8dd] px-4 py-3 text-left active:bg-[#fffaf4]"
              >
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2 truncate text-title font-black leading-none text-[#2b2f35]">
                    <span>{item.symbol}</span>
                    <span className="text-body truncate font-bold text-[#3a3d43]">
                      {item.name}
                    </span>
                  </p>
                </div>
                <p className="text-title font-black text-[#2b2f35]">{item.price}</p>
              </TradeTrigger>
            ))}
          </div>
        </div>

        <div className="text-helper px-4 py-3 text-[#b3a698]">
          最後更新 {updatedAt}
        </div>
      </div>
    </AppScreen>
  );
}
