"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import { useLanguage } from "../../components/LanguageProvider";
import { readAuthSession } from "../../lib/adapters/auth";
import {
  createInitialLeaderboardListPageData,
  getLeaderboardListPageData,
} from "../../lib/adapters/ranking";
import { byLanguage } from "../../lib/locale";
import { resolveAvatarSrc } from "../../lib/avatar";

function RankingMedal({ rank }: { rank: string }) {
  if (rank === "1") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffd665_0%,#f7a300_100%)] text-[14px] font-black text-white shadow-[0_8px_16px_rgba(230,118,0,0.18)]">
        1
      </span>
    );
  }

  if (rank === "2") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d7d9de_0%,#a6acb6_100%)] text-[14px] font-black text-white">
        2
      </span>
    );
  }

  if (rank === "3") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f0b77c_0%,#d57e2f_100%)] text-[14px] font-black text-white">
        3
      </span>
    );
  }

  return (
    <span className="w-8 text-center text-[17px] font-black leading-none text-[#342316]">
      {rank}
    </span>
  );
}

function RankingMovement({ movement }: { movement: "up" | "down" | "flat" }) {
  if (movement === "up") {
    return <ArrowUp className="h-4 w-4 text-[#2eb568]" strokeWidth={3} />;
  }

  if (movement === "down") {
    return <ArrowDown className="h-4 w-4 text-[#ef655d]" strokeWidth={3} />;
  }

  return <span className="text-[16px] font-bold text-[#c6b7a8]">-</span>;
}

export default function LeaderboardPage() {
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": {
      loading: "排行榜資料載入中...",
      empty: "暫無排行榜資料",
      loadError: "排行榜資料載入失敗",
      retry: "重新載入",
      back: "返回",
      title: "排行榜",
      subtitle: "按總資產與整體變動排序",
      rankMove: "排名/變動",
      participant: "參賽者",
      totalChange: "總資產/整體變動",
      limitHint: "最多展示前 100 位",
      currentUser: "我",
      updatedAt: "截至",
    },
    "zh-Hans": {
      loading: "排行榜资料加载中...",
      empty: "暂无排行榜资料",
      loadError: "排行榜资料加载失败",
      retry: "重新载入",
      back: "返回",
      title: "排行榜",
      subtitle: "按总资产与整体变动排序",
      rankMove: "排名/变动",
      participant: "参赛者",
      totalChange: "总资产/整体变动",
      limitHint: "最多展示前 100 位",
      currentUser: "我",
      updatedAt: "截至",
    },
    en: {
      loading: "Loading ranking list...",
      empty: "No ranking data yet",
      loadError: "Failed to load ranking list",
      retry: "Retry",
      back: "Back",
      title: "Ranking",
      subtitle: "Sorted by total assets and overall change",
      rankMove: "Rank/Move",
      participant: "Player",
      totalChange: "Assets/Change",
      limitHint: "Showing up to top 100",
      currentUser: "You",
      updatedAt: "As of",
    },
  });

  const [pageData, setPageData] = useState(createInitialLeaderboardListPageData());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setPageData(createInitialLeaderboardListPageData());
      const session = readAuthSession();
      const data = await getLeaderboardListPageData(session?.userId);
      if (!cancelled) {
        setPageData(data);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [language, refreshKey]);

  const { status, rows, updatedAt } = pageData;

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
        <div className="overflow-hidden bg-[linear-gradient(180deg,#ffb65c_0%,#ff9421_58%,#db7200_100%)] px-4 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_12px_28px_rgba(171,86,0,0.16)]">
          <div className="flex items-center gap-1 pb-2">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label={copy.back}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-page font-black">{copy.title}</h1>
          </div>
          <p className="pb-4 text-[14px] font-medium text-[#ffecce]">{copy.subtitle}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-[#ece3d8] px-4 py-3">
          <p className="text-helper font-semibold text-[#a88d6d]">{copy.limitHint}</p>
          <p className="text-helper text-right text-[#b5a89a]">
            {copy.updatedAt} {updatedAt}
          </p>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-end gap-2 border-b border-[#f0e5d8] px-4 pb-3 pt-4">
          <div>
            <p className="text-[14px] font-bold text-[#aa9781]">{copy.rankMove}</p>
            <p className="mt-1 text-[15px] font-bold text-[#aa9781]">{copy.participant}</p>
          </div>
          <div />
          <div className="text-right">
            <p className="text-[13px] font-bold text-[#aa9781]">HKD</p>
            <p className="mt-1 text-[15px] font-bold text-[#aa9781]">{copy.totalChange}</p>
          </div>
        </div>

        <div className="bg-white px-4">
          {rows.map((item, index) => {
            const avatarSrc = resolveAvatarSrc(item.avatar);
            return (
              <div key={`${item.rank}-${item.name}`} className={index !== 0 ? "border-t border-[#f5ede2]" : ""}>
              <div
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[18px] px-3 py-3 ${
                  item.isCurrentUser ? "bg-[#fff7ed] ring-1 ring-inset ring-[#f4d8b8]" : ""
                }`}
              >
                <div className="flex w-fit items-center gap-2">
                  <RankingMedal rank={item.rank} />
                  <RankingMovement movement={item.movement} />
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full border border-[#f2e7da] object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-black ${
                          item.isCurrentUser ? "bg-[#ffd6a1] text-[#9c5700]" : "bg-[#f0ece7] text-[#b19474]"
                        }`}
                      >
                        {item.rank}
                      </div>
                    )}
                    {item.isCurrentUser ? (
                      <span className="absolute -bottom-1 -right-2 rounded-full bg-[var(--app-orange-dark)] px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                        {copy.currentUser}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-[17px] font-black leading-none text-[#2a1b12]">
                    {item.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[16px] font-black leading-none text-[#2a1b12]">
                    {item.amount}
                  </p>
                  <p
                    className={`mt-1 text-[14px] font-black leading-none ${
                      item.gain.startsWith("-") ? "text-[#ef655d]" : "text-[#2eb568]"
                    }`}
                  >
                    {item.gain}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </AppScreen>
  );
}
