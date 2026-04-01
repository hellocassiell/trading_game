"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightLeft, ChevronRight, TrendingUp } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import MarketTable from "../../components/MarketTable";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import SubTabs from "../../components/SubTabs";
import { useLanguage } from "../../components/LanguageProvider";
import {
  createInitialTopHoldingsPageData,
  createInitialTopVolumePageData,
  getTopHoldingsPageData,
  getTopVolumePageData,
} from "../../lib/adapters/ranking";
import { byLanguage } from "../../lib/locale";
import { localizeStockName, localizeStockValueText } from "../../lib/stock-i18n";

export default function QuotesPage() {
  const { language } = useLanguage();
  const [topVolumeData, setTopVolumeData] = useState(createInitialTopVolumePageData());
  const [topHoldingsData, setTopHoldingsData] = useState(createInitialTopHoldingsPageData());
  const copy = byLanguage(language, {
    "zh-Hant": {
      title: "報價中心",
      hsi: "恒生指數",
      hscei: "國企指數",
      turnover: "成交額",
      asOf: "截至 16:00",
      turnoverValue: "1,289億",
      hotList: "熱門榜單",
      more: "更多",
      top10: "10大成交",
      top20: "20大持倉",
      headerLeft: "10大成交港股",
      amount: "金額",
      holdingWatch: "參賽者持倉觀察",
      topHoldingTitle: "參賽者20大港股持倉",
      topHoldingHint: "龍頭股",
    },
    "zh-Hans": {
      title: "报价中心",
      hsi: "恒生指数",
      hscei: "国企指数",
      turnover: "成交额",
      asOf: "截至 16:00",
      turnoverValue: "1,289亿",
      hotList: "热门榜单",
      more: "更多",
      top10: "10大成交",
      top20: "20大持仓",
      headerLeft: "10大成交港股",
      amount: "金额",
      holdingWatch: "参赛者持仓观察",
      topHoldingTitle: "参赛者20大港股持仓",
      topHoldingHint: "龙头股",
    },
    en: {
      title: "Quote Center",
      hsi: "HSI",
      hscei: "HSCEI",
      turnover: "Turnover",
      asOf: "As of 16:00",
      turnoverValue: "HK$128.9B",
      hotList: "Hot Lists",
      more: "More",
      top10: "Top 10 Turnover",
      top20: "Top 20 Holdings",
      headerLeft: "Top 10 HK Turnover",
      amount: "Amount",
      holdingWatch: "Holding Watch",
      topHoldingTitle: "Top 20 HK Holdings",
      topHoldingHint: "Leader",
      loading: "Loading quotes...",
      loadError: "Failed to load leaderboard data",
      empty: "No leaderboard data yet",
      retry: "Retry",
    },
  });

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setTopVolumeData(createInitialTopVolumePageData());
      setTopHoldingsData(createInitialTopHoldingsPageData());

      const [volume, holdings] = await Promise.all([
        getTopVolumePageData(),
        getTopHoldingsPageData(),
      ]);
      if (cancelled) {
        return;
      }
      setTopVolumeData(volume);
      setTopHoldingsData(holdings);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const isLoading =
    topVolumeData.status === "loading" ||
    topHoldingsData.status === "loading";
  const hasError =
    topVolumeData.status === "error" &&
    topHoldingsData.status === "error";

  const topVolume = topVolumeData.buyRows;
  const topHoldings = topHoldingsData.rows;

  if (isLoading) {
    return (
      <AppScreen>
        <ScreenTopBar title={copy.title} showBack backHref="/" />
        <div className="app-panel mt-4 rounded-[24px] px-4 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.loading}</p>
        </div>
      </AppScreen>
    );
  }

  if (hasError) {
    return (
      <AppScreen>
        <ScreenTopBar title={copy.title} showBack backHref="/" />
        <div className="app-panel mt-4 rounded-[24px] px-4 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.loadError}</p>
        </div>
      </AppScreen>
    );
  }

  if (topVolume.length === 0 && topHoldings.length === 0) {
    return (
      <AppScreen>
        <ScreenTopBar title={copy.title} showBack backHref="/" />
        <div className="app-panel mt-4 rounded-[24px] px-4 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.empty}</p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenTopBar title={copy.title} showBack backHref="/" />

      <div className="space-y-4 pt-4">
      <SurfaceCard className="px-3 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">{copy.hsi}</p>
            <p className="mt-1 text-[13px] font-bold text-[#ef4444]">17,632</p>
            <p className="text-[9px] text-[#ef4444]">+1.08%</p>
          </div>
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">{copy.hscei}</p>
            <p className="mt-1 text-[13px] font-bold text-[#22c55e]">6,158</p>
            <p className="text-[9px] text-[#22c55e]">-0.34%</p>
          </div>
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">{copy.turnover}</p>
            <p className="mt-1 text-[13px] font-bold text-[var(--app-orange-dark)]">{copy.turnoverValue}</p>
            <p className="text-[9px] text-[#8fa0b6]">{copy.asOf}</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff1de] text-[var(--app-orange-dark)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-[12px] font-semibold text-[#4f5d73]">{copy.hotList}</p>
          </div>
          <Link href="/more" className="flex items-center gap-0.5 text-[10px] text-[var(--app-orange-dark)]">
            {copy.more}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <SubTabs
          tabs={[
            { label: copy.top10, active: true, href: "/market/top-volume" },
            { label: copy.top20, href: "/market/top-holdings" },
          ]}
        />
      </SurfaceCard>

      <MarketTable
        headerLeft={copy.headerLeft}
        headerRight={copy.amount}
        rows={topVolume.map((item) => ({
          symbol: item.symbol,
          name: localizeStockName(item.symbol, item.name, language),
          value: localizeStockValueText(item.price, language),
        }))}
      />

      <SurfaceCard className="px-3 py-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff5e8] text-[#d97706]">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <p className="text-[12px] font-semibold text-[#4f5d73]">{copy.holdingWatch}</p>
        </div>
        <div className="space-y-2">
          <Link href="/market/top-holdings" className="block rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#4f5d73]">{copy.topHoldingTitle}</p>
                <p className="mt-0.5 text-[9px] text-[#a3acb9]">
                  {copy.topHoldingHint}：{topHoldings[0]?.symbol ?? "--"} {localizeStockValueText(topHoldings[0]?.value ?? "0 港元", language)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8fa0b6]" />
            </div>
          </Link>
        </div>
      </SurfaceCard>
      </div>
    </AppScreen>
  );
}
