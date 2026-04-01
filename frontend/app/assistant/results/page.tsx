"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { useLanguage } from "../../../components/LanguageProvider";
import ScreenTopBar from "../../../components/ScreenTopBar";
import SurfaceCard from "../../../components/SurfaceCard";
import { TradeTrigger } from "../../../components/TradeModal";
import { createInitialAssistantSearchData, getAssistantSearchData } from "../../../lib/adapters/assistant";
import { byLanguage } from "../../../lib/locale";

function readInitialKeyword() {
  if (typeof window === "undefined") {
    return "A";
  }
  const q = new URLSearchParams(window.location.search).get("q");
  const next = (q ?? "A").trim();
  return next || "A";
}

export default function AssistantResultsPage() {
  const { language } = useLanguage();
  const [keyword] = useState(readInitialKeyword);
  const [searchData, setSearchData] = useState(createInitialAssistantSearchData(keyword));
  const copy = byLanguage(language, {
    "zh-Hant": { title: "搜尋結果", back: "返回", matched: "匹配", loading: "載入中...", empty: "暫無匹配股票", loadError: "載入失敗" },
    "zh-Hans": { title: "搜索结果", back: "返回", matched: "匹配", loading: "加载中...", empty: "暂无匹配股票", loadError: "加载失败" },
    en: { title: "Search Results", back: "Back", matched: "Match", loading: "Loading...", empty: "No matched stocks", loadError: "Failed to load" },
  });

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setSearchData(createInitialAssistantSearchData(keyword));
      const data = await getAssistantSearchData(keyword);
      if (!cancelled) {
        setSearchData(data);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [keyword, language]);

  return (
    <AppScreen>
      <ScreenTopBar title={copy.title} showBack backHref="/more" showSearch compact />

      <div className="pt-4">
      <SurfaceCard className="overflow-hidden px-0 py-0">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between gap-2 rounded-[10px] border border-[#f4d8b8] bg-[#fffaf4] px-3 py-2">
            <div className="flex min-w-0 items-center">
              <Search className="h-3.5 w-3.5 text-[var(--app-orange)]" />
              <span className="ml-2 text-[10px] font-medium text-[var(--app-orange-dark)]">{searchData.keyword || keyword}</span>
            </div>
            <Link href="/more" className="shrink-0 text-[9px] text-[var(--app-orange-dark)]">
              {copy.back}
            </Link>
          </div>

          <div className="mt-3 rounded-[10px] border border-[#f1e8dd] bg-white">
            {searchData.status === "loading" ? (
              <p className="px-3 py-3 text-[10px] text-[#95a0b0]">{copy.loading}</p>
            ) : searchData.status === "error" ? (
              <p className="px-3 py-3 text-[10px] text-[#d26666]">{copy.loadError}</p>
            ) : searchData.rows.length === 0 ? (
              <p className="px-3 py-3 text-[10px] text-[#95a0b0]">{copy.empty}</p>
            ) : (
              searchData.rows.map((item, index) => (
                <TradeTrigger
                  key={`${item.symbol}-${item.code}`}
                  symbol={item.code}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-dashed border-[#f1e8dd] px-3 py-2 last:border-b-0 ${
                    index === 0 ? "bg-[#fff8ef]" : index % 2 === 0 ? "bg-[#fffdf9]" : ""
                  }`}
                >
                  <span className="text-[10px] text-[#ef4444]">●</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5f6c80]">{item.symbol}</span>
                    {index === 0 ? (
                      <span className="rounded-full bg-[#fff1de] px-1.5 py-0.5 text-[8px] font-bold text-[var(--app-orange-dark)]">
                        {copy.matched}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[9px] font-medium text-[var(--app-orange-dark)]">{item.code}</span>
                </TradeTrigger>
              ))
            )}
          </div>
        </div>

      </SurfaceCard>
      </div>
    </AppScreen>
  );
}
