"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import { useLanguage } from "../../components/LanguageProvider";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { createInitialAssistantSearchData, getAssistantSearchData } from "../../lib/adapters/assistant";
import { byLanguage } from "../../lib/locale";

export default function AssistantPage() {
  const { language } = useLanguage();
  const [searchData, setSearchData] = useState(createInitialAssistantSearchData(""));
  const copy = byLanguage(language, {
    "zh-Hant": {
      title: "猜想列表",
      searchPlaceholder: "輸入股票名稱或代號，例如 A",
      switchPage: "切換到已輸入 A 的結果頁",
      loading: "載入中...",
      empty: "暫無匹配股票",
      loadError: "載入失敗",
    },
    "zh-Hans": {
      title: "猜想列表",
      searchPlaceholder: "输入股票名称或代号，例如 A",
      switchPage: "切换到已输入 A 的结果页",
      loading: "加载中...",
      empty: "暂无匹配股票",
      loadError: "加载失败",
    },
    en: {
      title: "Guess List",
      searchPlaceholder: "Enter stock name or ticker, e.g. A",
      switchPage: "Switch to results page with A",
      loading: "Loading...",
      empty: "No matched stocks",
      loadError: "Failed to load",
    },
  });
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setSearchData(createInitialAssistantSearchData(""));
      const data = await getAssistantSearchData("");
      if (!cancelled) {
        setSearchData(data);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <AppScreen>
      <ScreenTopBar title={copy.title} showSearch compact />

      <SurfaceCard className="overflow-hidden px-0 py-0">
        <div className="px-2.5 py-2">
          <div className="flex items-center rounded-[4px] border border-[#e6edf8] bg-[#fafcff] px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-[#b0b8c5]" />
            <span className="ml-1.5 text-[9px] text-[#b0b8c5]">
              {copy.searchPlaceholder}
            </span>
          </div>

          <div className="mt-2 rounded-[4px] border border-[#edf1f8] bg-white">
            {searchData.status === "loading" ? (
              <p className="px-2 py-2 text-[9px] text-[#95a0b0]">{copy.loading}</p>
            ) : searchData.status === "error" ? (
              <p className="px-2 py-2 text-[9px] text-[#d26666]">{copy.loadError}</p>
            ) : searchData.rows.length === 0 ? (
              <p className="px-2 py-2 text-[9px] text-[#95a0b0]">{copy.empty}</p>
            ) : (
              searchData.rows.map((item) => (
                <Link
                  key={`${item.symbol}-${item.code}`}
                  href={`/trade/${item.code}`}
                  className="grid grid-cols-[1fr_auto] items-center border-b border-dashed border-[#edf1f8] px-2 py-1.5 last:border-b-0"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#ef4444]">●</span>
                    <span className="text-[9px] text-[#5f6c80]">{item.symbol}</span>
                  </div>
                  <span className="text-[8px] text-[#adb7c5]">{item.code}</span>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/assistant/results?q=A"
            className="mt-2 inline-flex rounded-full bg-[#edf4ff] px-2 py-1 text-[8px] font-semibold text-[#4976e8]"
          >
            {copy.switchPage}
          </Link>
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}
