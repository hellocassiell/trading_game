"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { TradeTrigger } from "../../../components/TradeModal";
import { useLanguage } from "../../../components/LanguageProvider";
import {
  createInitialTopLoserHoldingsPageData,
  getTopLoserHoldingsPageData,
} from "../../../lib/adapters/ranking";
import { byLanguage } from "../../../lib/locale";
import { localizeStockName, localizeStockValueText } from "../../../lib/stock-i18n";

export default function TopLoserHoldingsPage() {
  const { language } = useLanguage();
  const [pageData, setPageData] = useState(createInitialTopLoserHoldingsPageData());
  const [refreshKey, setRefreshKey] = useState(0);
  const copy = byLanguage(language, {
    "zh-Hant": {
      back: "返回",
      title: "參賽者20大失敗持倉",
      codeName: "代號及名稱",
      lossAmount: "跌幅金額",
      updatedAt: "最後更新",
      loading: "失敗持倉載入中...",
      empty: "暫無失敗持倉資料",
      loadError: "失敗持倉載入失敗",
      retry: "重新載入",
    },
    "zh-Hans": {
      back: "返回",
      title: "参赛者20大失败持仓",
      codeName: "代号及名称",
      lossAmount: "跌幅金额",
      updatedAt: "最后更新",
      loading: "失败持仓加载中...",
      empty: "暂无失败持仓资料",
      loadError: "失败持仓加载失败",
      retry: "重新载入",
    },
    en: {
      back: "Back",
      title: "Top 20 Losing Holdings",
      codeName: "Code & Name",
      lossAmount: "Loss Amount",
      updatedAt: "Updated",
      loading: "Loading losing holdings...",
      empty: "No losing holdings yet",
      loadError: "Failed to load losing holdings",
      retry: "Retry",
    },
  });
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setPageData(createInitialTopLoserHoldingsPageData());
      const data = await getTopLoserHoldingsPageData();
      if (!cancelled) {
        setPageData(data);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [language, refreshKey]);

  if (pageData.status === "loading") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.loading}</p>
        </div>
      </AppScreen>
    );
  }

  if (pageData.status === "error") {
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

  if (pageData.status === "empty") {
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
        <div className="overflow-hidden bg-[linear-gradient(180deg,#ffb65c_0%,#ff9421_58%,#db7200_100%)] px-4 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_12px_28px_rgba(171,86,0,0.16)]">
          <div className="flex items-center gap-1 pb-5">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label={copy.back}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-page font-black">{copy.title}</h1>
          </div>
        </div>

        <div className="text-helper grid grid-cols-[1fr_auto] items-center border-b border-[#ece3d8] px-4 py-2.5 font-semibold text-[#b3a79b]">
          <span>{copy.codeName}</span>
          <span>{copy.lossAmount}</span>
        </div>

        <div className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute bottom-[-16px] left-[22px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#f7f2ea] opacity-90">
            A
          </div>
          <div className="pointer-events-none absolute bottom-[-24px] right-[18px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#f8f3eb] opacity-90">
            A
          </div>

          <div className="relative">
            {pageData.rows.map((item, index) => (
              <TradeTrigger
                key={`${item.symbol}-${index}`}
                symbol={item.symbol}
                className="grid min-h-[52px] w-full grid-cols-[1fr_auto] items-center border-b border-[#f1e8dd] px-4 py-3 text-left active:bg-[#fffaf4]"
              >
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="text-title shrink-0 font-black leading-none text-[#2f2f31]">
                    {item.symbol}
                  </span>
                  <span className="text-body truncate font-bold leading-none text-[#3e4045]">
                    {localizeStockName(item.symbol, item.name, language)}
                  </span>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <span className="text-title whitespace-nowrap font-black leading-none text-[#2f2f31]">
                    {localizeStockValueText(item.loss, language)}
                  </span>
                  <span className="text-page font-black leading-none text-[#ef5b52]">↓</span>
                </div>
              </TradeTrigger>
            ))}
          </div>
        </div>

        <div className="text-helper px-4 py-3 text-[#b5a89a]">{copy.updatedAt} {pageData.updatedAt}</div>
      </div>
    </AppScreen>
  );
}
