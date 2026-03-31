"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { TradeTrigger } from "../../../components/TradeModal";
import { useLanguage } from "../../../components/LanguageProvider";
import {
  createInitialTopVolumePageData,
  getTopVolumePageData,
} from "../../../lib/adapters/ranking";
import { byLanguage } from "../../../lib/locale";
import { localizeStockName, localizeStockValueText } from "../../../lib/stock-i18n";

export default function TopVolumePage() {
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": {
      tabBuy: "10大買入",
      tabSell: "10大賣出",
      loading: "成交榜單載入中...",
      empty: "暫無成交榜單資料",
      loadError: "成交榜單載入失敗",
      retry: "重新載入",
      back: "返回",
      title: "今日10大成交港股",
      codeName: "代號及名稱",
      buyAmount: "總買入金額",
      sellAmount: "總賣出金額",
      updatedAt: "最後更新",
    },
    "zh-Hans": {
      tabBuy: "10大买入",
      tabSell: "10大卖出",
      loading: "成交榜单加载中...",
      empty: "暂无成交榜单资料",
      loadError: "成交榜单加载失败",
      retry: "重新载入",
      back: "返回",
      title: "今日10大成交港股",
      codeName: "代号及名称",
      buyAmount: "总买入金额",
      sellAmount: "总卖出金额",
      updatedAt: "最后更新",
    },
    en: {
      tabBuy: "Top 10 Buy",
      tabSell: "Top 10 Sell",
      loading: "Loading turnover list...",
      empty: "No turnover data yet",
      loadError: "Failed to load turnover list",
      retry: "Retry",
      back: "Back",
      title: "Top 10 HK Turnover Today",
      codeName: "Code & Name",
      buyAmount: "Total Buy Amount",
      sellAmount: "Total Sell Amount",
      updatedAt: "Updated",
    },
  });

  const tabs = [
    { key: "buy", label: copy.tabBuy },
    { key: "sell", label: copy.tabSell },
  ] as const;

  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [pageData, setPageData] = useState(createInitialTopVolumePageData());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setPageData(createInitialTopVolumePageData());
      const data = await getTopVolumePageData();
      if (!cancelled) {
        setPageData(data);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [language, refreshKey]);

  const { status, buyRows, sellRows, updatedAt } = pageData;
  const rows = activeTab === "buy" ? buyRows : sellRows;

  if (status === "loading") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.loading}</p>
        </div>
      </AppScreen>
    );
  }

  if (status === "error") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.loadError}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-4 rounded-full bg-[var(--app-orange)] px-4 py-2 text-body font-black text-white"
          >
            {copy.retry}
          </button>
        </div>
      </AppScreen>
    );
  }

  if (status === "empty") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.empty}</p>
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
              aria-label={copy.back}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-page font-black">{copy.title}</h1>
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
          <span>{copy.codeName}</span>
          <span>{activeTab === "buy" ? copy.buyAmount : copy.sellAmount}</span>
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
                      {localizeStockName(item.symbol, item.name, language)}
                    </span>
                  </p>
                </div>
                <p className="text-title font-black text-[#2b2f35]">{localizeStockValueText(item.price, language)}</p>
              </TradeTrigger>
            ))}
          </div>
        </div>

        <div className="text-helper px-4 py-3 text-[#b3a698]">
          {copy.updatedAt} {updatedAt}
        </div>
      </div>
    </AppScreen>
  );
}
