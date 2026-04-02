"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronRight,
  Coins,
  Medal,
  Repeat2,
  Share2,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { TradeTrigger } from "../components/TradeModal";
import { readAuthSession } from "../lib/adapters/auth";
import type { AuthSession } from "../lib/adapters/auth";
import { createInitialHomePageData, getHomePageData } from "../lib/adapters/home";
import { resolveAvatarSrc } from "../lib/avatar";
import { byLanguage } from "../lib/locale";
import { useLanguage, useLanguageReady } from "../components/LanguageProvider";

function SectionTitle({
  title,
  href,
  moreLabel = "More",
}: {
  title: string;
  href?: string;
  moreLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-page font-black leading-none text-[#24180f]">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="text-label inline-flex items-center gap-0.5 font-bold text-[var(--app-orange-dark)]"
        >
          {moreLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function EventStatIcon({ icon }: { icon: string }) {
  if (icon === "users") {
    return <Users className="h-4 w-4" />;
  }
  if (icon === "value") {
    return <Wallet className="h-4 w-4" />;
  }
  if (icon === "coin") {
    return <Coins className="h-4 w-4" />;
  }

  return <Repeat2 className="h-4 w-4" />;
}

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

function RankingMovement({ movement }: { movement: string }) {
  if (movement === "up") {
    return <ArrowUp className="h-4 w-4 text-[#2eb568]" strokeWidth={3} />;
  }

  if (movement === "down") {
    return <ArrowDown className="h-4 w-4 text-[#ef655d]" strokeWidth={3} />;
  }

  return <span className="text-[16px] font-bold text-[#c6b7a8]">-</span>;
}

export default function HomePage() {
  const { language } = useLanguage();
  const languageReady = useLanguageReady();
  const copy = byLanguage(language, {
    "zh-Hant": {
      more: "更多",
      pageLoadError: "主頁載入失敗",
      pageLoadErrorHint: "請稍後再試，或返回上一頁重試。",
      empty: "暫無賽事資料",
      share: "分享",
      notify: "通知",
      competitionTitle: "智財港股投資大賽2026",
      sponsoredBy: "由 Citi 贊助",
      statsTitle: "賽事統計",
      currencyHkd: "港元",
      updatedAt: "最後更新",
      heroLine1: "想賺取",
      heroLine2: "HK1,000,000港元模擬交易資金？",
      viewDetail: "查看詳情",
      summaryLoadError: "資料載入失敗",
      reload: "重新載入",
      rank: "排名",
      remain: "尚餘",
      lack: "尚欠",
      secValue: "證券參考市值",
      availableCash: "可投資餘額",
      totalAssets: "資產總值",
      dataUpdated: "資料更新",
      starTraders: "星級參賽者",
      topHoldings: "參賽者20大港股持倉",
      topVolume: "今日10大成交港股",
      weeklyFlyer: "每周飛躍王",
      overallChange: "整體變動",
      ranking: "排行榜",
      rankMove: "排名/變動",
      participant: "參賽者",
      totalChange: "總資產/整體變動",
      asOf: "截至",
      keyTotalAssets: "資產總值",
      keyHolding: "重倉港股",
      keyRecentTrade: "最近交易",
    },
    "zh-Hans": {
      more: "更多",
      pageLoadError: "主页加载失败",
      pageLoadErrorHint: "请稍后再试，或返回上一页重试。",
      empty: "暂无赛事资料",
      share: "分享",
      notify: "通知",
      competitionTitle: "智财港股投资大赛2026",
      sponsoredBy: "由 Citi 赞助",
      statsTitle: "赛事统计",
      currencyHkd: "港元",
      updatedAt: "最后更新",
      heroLine1: "想赚取",
      heroLine2: "HK1,000,000港元模拟交易资金？",
      viewDetail: "查看详情",
      summaryLoadError: "资料加载失败",
      reload: "重新载入",
      rank: "排名",
      remain: "尚余",
      lack: "尚欠",
      secValue: "证券参考市值",
      availableCash: "可投资余额",
      totalAssets: "资产总值",
      dataUpdated: "资料更新",
      starTraders: "星级参赛者",
      topHoldings: "参赛者20大港股持仓",
      topVolume: "今日10大成交港股",
      weeklyFlyer: "每周飞跃王",
      overallChange: "整体变动",
      ranking: "排行榜",
      rankMove: "排名/变动",
      participant: "参赛者",
      totalChange: "总资产/整体变动",
      asOf: "截至",
      keyTotalAssets: "资产总值",
      keyHolding: "重仓港股",
      keyRecentTrade: "最近交易",
    },
    en: {
      more: "More",
      pageLoadError: "Failed to load home page",
      pageLoadErrorHint: "Please try again later or go back and retry.",
      empty: "No competition data yet",
      share: "Share",
      notify: "Notifications",
      competitionTitle: "HK Stock Trading Game 2026",
      sponsoredBy: "Sponsored by Citi",
      statsTitle: "Competition Stats",
      currencyHkd: "HKD",
      updatedAt: "Updated",
      heroLine1: "Want to win",
      heroLine2: "HK$1,000,000 virtual trading capital?",
      viewDetail: "View details",
      summaryLoadError: "Failed to load data",
      reload: "Reload",
      rank: "Rank",
      remain: "Remaining",
      lack: "Needed",
      secValue: "Securities value",
      availableCash: "Available cash",
      totalAssets: "Total assets",
      dataUpdated: "Data updated",
      starTraders: "Star Traders",
      topHoldings: "Top 20 HK Holdings",
      topVolume: "Top 10 HK Turnover Today",
      weeklyFlyer: "Weekly Flyers",
      overallChange: "Overall change",
      ranking: "Ranking",
      rankMove: "Rank/Move",
      participant: "Player",
      totalChange: "Assets/Change",
      asOf: "As of",
      keyTotalAssets: "Total Assets",
      keyHolding: "Top Holding",
      keyRecentTrade: "Recent Trade",
    },
  });
  const [homeData, setHomeData] = useState(createInitialHomePageData());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [pageRefreshKey, setPageRefreshKey] = useState(0);
  const [activeStarTab, setActiveStarTab] = useState("");
  const [activeWeeklyTab, setActiveWeeklyTab] = useState("");

  useEffect(() => {
    // 等待语言状态就绪后再调用接口
    if (!languageReady) return;

    let cancelled = false;
    async function loadPageData() {
      const session = readAuthSession();
      const loggedIn = Boolean(session?.userId || session?.phone);
      if (!cancelled) {
        setIsLoggedIn(loggedIn);
        setAuthSession(session);
      }
      const data = await getHomePageData(language, session?.userId);
      if (!cancelled) {
        setHomeData(data);
      }
    }
    void loadPageData();
    return () => {
      cancelled = true;
    };
  }, [language, pageRefreshKey, languageReady]);

  const {
    status,
    appMeta,
    eventStats: localizedEventStats,
    eventStatsUpdatedAt,
    summaryCard: homeSummaryState,
    starParticipants: homeStarParticipants,
    holdingCloud: localizedHoldingCloud,
    holdingCloudUpdatedAt,
    volumeSnapshot: localizedVolumeSnapshot,
    volumeSnapshotUpdatedAt,
    weeklyFlyers: homeWeeklyFlyers,
    rankingRows: homeRankingRows,
    rankingUpdatedAt,
  } = homeData;

  const resolvedActiveStarTab =
    activeStarTab && homeStarParticipants.tabs.includes(activeStarTab)
      ? activeStarTab
      : homeStarParticipants.tabs[0] ?? "";

  const resolvedActiveWeeklyTab =
    activeWeeklyTab && homeWeeklyFlyers.tabs.includes(activeWeeklyTab)
      ? activeWeeklyTab
      : homeWeeklyFlyers.tabs[0] ?? "";

  const starFeatured = useMemo(() => {
    if (!resolvedActiveStarTab) {
      return null;
    }
    return homeStarParticipants.items[resolvedActiveStarTab] ?? null;
  }, [resolvedActiveStarTab, homeStarParticipants.items]);
  const starFeaturedAvatarSrc = resolveAvatarSrc(starFeatured?.avatar ?? "");
  const starRankingHref = starFeatured?.userId
    ? `/ranking?userId=${encodeURIComponent(starFeatured.userId)}`
    : resolvedActiveStarTab
      ? `/ranking?tab=${encodeURIComponent(resolvedActiveStarTab)}`
      : "/ranking";

  const weeklyFeatured = useMemo(() => {
    if (!resolvedActiveWeeklyTab) {
      return null;
    }
    return homeWeeklyFlyers.items[resolvedActiveWeeklyTab] ?? null;
  }, [resolvedActiveWeeklyTab, homeWeeklyFlyers.items]);

  const rankDeltaValue = Number(homeSummaryState.rankRise);
  const rankDeltaLabel = Number.isFinite(rankDeltaValue)
    ? rankDeltaValue === 0
      ? "—"
      : rankDeltaValue > 0
        ? `↑ ${rankDeltaValue}`
        : `↓ ${Math.abs(rankDeltaValue)}`
    : "—";
  const rankDeltaTone = Number.isFinite(rankDeltaValue)
    ? rankDeltaValue > 0
      ? "text-[#2eb568]"
      : rankDeltaValue < 0
        ? "text-[#ef655d]"
        : "text-[#b8a08a]"
    : "text-[#b8a08a]";
  const avatarValue = (
    homeSummaryState.avatar ||
    authSession?.avatarId ||
    ""
  ).trim();
  const avatarSrc = resolveAvatarSrc(avatarValue);

  if (status === "loading") {
    return (
      <div className="px-[var(--app-gutter)] py-10">
        <div className="app-panel rounded-[28px] px-5 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.statsTitle}</p>
          <p className="text-helper mt-2 text-[#9d8162]">{copy.updatedAt} ...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="px-[var(--app-gutter)] py-10">
        <div className="app-panel rounded-[28px] px-5 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.pageLoadError}</p>
          <p className="text-helper mt-2 text-[#9d8162]">{copy.pageLoadErrorHint}</p>
          <button
            type="button"
            onClick={() => setPageRefreshKey((prev) => prev + 1)}
            className="mt-4 h-9 rounded-full bg-[var(--app-orange-dark)] px-5 text-[13px] font-bold text-white"
          >
            {copy.reload}
          </button>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="px-[var(--app-gutter)] py-10">
        <div className="app-panel rounded-[28px] px-5 py-8 text-center">
          <p className="text-page font-black text-[#2a1b12]">{copy.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-[#533b23]">
      <header className="overflow-hidden bg-[linear-gradient(180deg,#ffbb69_0%,#ff9825_53%,#dc7300_100%)] px-[var(--app-gutter)] pb-5 pt-[max(env(safe-area-inset-top),12px)] text-white shadow-[0_18px_32px_rgba(171,86,0,0.2)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1 text-[15px] font-black tracking-[0.03em]">
            <span>{appMeta.brand}</span>
            <ChevronRight className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label={copy.share}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label={copy.notify}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffe06d]" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-white px-3 py-2 text-[#6b4a21] shadow-[0_10px_20px_rgba(98,56,10,0.12)]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0d8] text-[var(--app-orange-dark)]">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-black">{copy.competitionTitle}</span>
          </div>
          <span className="text-[13px] font-bold text-[#7b5c38]">{copy.sponsoredBy}</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/78">
              HONG KONG STOCK TRADING GAME
            </p>
            <h1 className="mt-1 text-[22px] font-black leading-none">{copy.statsTitle}</h1>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[12px] font-bold">
            <span className="text-[15px]">🇭🇰</span>
            <span>{copy.currencyHkd}</span>
          </div>
        </div>

        <div className="mt-3 rounded-[28px] bg-white px-4 py-4 text-[#412c1a] shadow-[0_16px_28px_rgba(95,53,7,0.14)]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {localizedEventStats.map((item) => (
              <div key={item.label} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff5e8_0%,#ffe1ba_100%)] text-[var(--app-orange-dark)]">
                  <EventStatIcon icon={item.icon} />
                </div>
                <p className="mt-2 text-[12px] font-bold leading-tight text-[#6d5a45]">
                  {item.label}
                </p>
                <p className="mt-1 text-[16px] font-black leading-tight text-[#22160d]">
                  {item.primary}
                </p>
                {item.secondary ? (
                  <p className="mt-0.5 text-[13px] font-bold leading-tight text-[#46301d]">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#b19573]">{copy.updatedAt} {eventStatsUpdatedAt}</p>
        </div>
      </header>

      <main className="stack-gap-4 px-[var(--app-gutter)] pb-5 pt-3">
        <Link
          href="/guest"
          className="relative block overflow-hidden rounded-[24px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]"
        >
          <div className="absolute inset-y-0 right-0 w-[45%] bg-[radial-gradient(circle_at_top,rgba(255,198,132,0.38),transparent_55%)]" />
          <div className="relative flex items-center gap-3">
            <div className="relative h-14 w-16 shrink-0">
              <div className="absolute left-0 top-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff0d8] text-[var(--app-orange-dark)] shadow-[0_8px_16px_rgba(255,177,81,0.18)]">
                <Coins className="h-5 w-5" />
              </div>
              <div className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffd37e_0%,#ff9a1f_100%)] text-white shadow-[0_8px_16px_rgba(243,139,27,0.22)]">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[15px] font-black leading-tight text-[#392416]">{copy.heroLine1}</p>
              <p className="mt-1 text-[17px] font-black leading-tight text-[var(--app-orange-dark)]">
                {copy.heroLine2}
              </p>
              <p className="mt-1.5 text-[13px] font-bold text-[#f18917]">{copy.viewDetail}</p>
            </div>
          </div>
        </Link>

        {isLoggedIn ? (
          <Link
            href="/profile"
            className="block overflow-hidden rounded-[24px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ece7]">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={homeSummaryState.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-6 w-6 text-[#d7d0c7]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-black leading-none text-[#26180f]">
                    {homeSummaryState.name}
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-full bg-[#fff4e5] px-3 py-1.5 text-[13px] font-black text-[#6b4a21]">
                <span className="inline-flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-[var(--app-orange-dark)]" />
                  {copy.rank} {homeSummaryState.rank}
                  <span className={rankDeltaTone}>{rankDeltaLabel}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-[14px] font-bold text-[#4d3826]">
              <div>
                <p>{homeSummaryState.dailyTrades}</p>
                <p className="mt-1">{homeSummaryState.requiredTrades}</p>
              </div>
              <div className="text-right">
                <p>
                  {copy.remain} <span className="text-[20px] font-black">{homeSummaryState.dailyTradesValue}</span>
                </p>
                <p className="mt-1">
                  {copy.lack}{" "}
                  <span className="text-[20px] font-black text-[#ef655d]">
                    {homeSummaryState.requiredTradesValue}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-[20px] bg-[#fffaf4] px-3.5 py-3">
              <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#7a624a]">
                <span>{copy.secValue}</span>
                <span className="text-[18px] font-black text-[#291b12]">
                  {homeSummaryState.referenceValue} {language === "en" ? "HKD" : "港元"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#7a624a]">
                <span>{copy.availableCash}</span>
                <span className="text-[18px] font-black text-[#291b12]">{homeSummaryState.cash} {language === "en" ? "HKD" : "港元"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#5f472d]">
                <span>{copy.totalAssets}</span>
                <span className="text-[20px] font-black text-[var(--app-orange-dark)]">
                  {homeSummaryState.totalAssets} {language === "en" ? "HKD" : "港元"}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] font-medium text-[#b19573]">
              {copy.dataUpdated} {homeSummaryState.updatedAt}
            </p>
          </Link>
        ) : null}

        <section className="space-y-3">
          <SectionTitle title={copy.starTraders} href="/ranking" moreLabel={copy.more} />

          <div className="flex gap-2">
            {homeStarParticipants.tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStarTab(tab)}
                className={`rounded-full px-4 py-2 text-[17px] font-black leading-none ${
                  tab === resolvedActiveStarTab ? "bg-[#ffe8c5] text-[#bf7210]" : "bg-[#fff5e7] text-[#c59d6c]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            href={starRankingHref}
            className="relative block overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]"
          >
            <div className="pointer-events-none absolute -left-6 top-6 h-16 w-16 rounded-full bg-[#f4efe8]" />
            <div className="pointer-events-none absolute -right-8 top-8 h-16 w-16 rounded-full bg-[#faf2e4]" />

            <div className="relative flex items-start gap-3">
              {starFeaturedAvatarSrc ? (
                <Image
                  src={starFeaturedAvatarSrc}
                  alt={starFeatured?.name ?? "star trader"}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full border border-[#f4ddc2] object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-full bg-[#f0ece7]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[20px] font-black leading-none text-[#26180f]">
                      {starFeatured?.name ?? "--"}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff2dc] px-3 py-1 text-[13px] font-black text-[#6e4b21]">
                      <Medal className="h-4 w-4 text-[var(--app-orange-dark)]" />
                      {starFeatured?.tag ?? "--"}
                    </span>
                </div>

                <p className="mt-3 text-[17px] font-medium leading-[1.3] text-[#4a3828]">
                  {starFeatured?.intro ?? "--"}
                </p>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[15px]">
                  <span className="font-bold text-[#9f8d78]">{copy.keyTotalAssets}</span>
                  <span className="text-right text-[20px] font-black text-[var(--app-orange-dark)]">
                    {starFeatured?.totalAssets ?? "--"}
                  </span>
                  <span className="font-bold text-[#9f8d78]">{copy.keyHolding}</span>
                  <span className="text-right text-[19px] font-black text-[#2b1d13]">
                    {starFeatured?.holding ?? "--"}
                  </span>
                  <span className="font-bold text-[#9f8d78]">{copy.keyRecentTrade}</span>
                  <span className="text-right text-[19px] font-black text-[#2b1d13]">
                    {starFeatured?.recentTrade ?? "--"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        <section className="space-y-3">
          <SectionTitle title={copy.topHoldings} href="/market/top-holdings" moreLabel={copy.more} />

          <div className="relative h-[234px] overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="pointer-events-none absolute left-3 top-6 h-7 w-7 rounded-full bg-[#ffe6bd]" />
            <div className="pointer-events-none absolute left-10 bottom-7 h-9 w-9 rounded-full bg-[#fff0d5]" />
            <div className="pointer-events-none absolute right-6 top-7 h-8 w-8 rounded-full bg-[#ffe5c1]" />
            <div className="pointer-events-none absolute right-3 bottom-8 h-10 w-10 rounded-full bg-[#fff0d8]" />

            {localizedHoldingCloud.map((item) => (
              <div
                key={`${item.rank}-${item.symbol}`}
                className="absolute"
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                }}
              >
                <TradeTrigger
                  symbol={item.symbol}
                  className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffbf73_0%,#ff9220_62%,#de7600_100%)] text-center text-white shadow-[0_18px_24px_rgba(230,118,0,0.18)]"
                >
                  <span className="text-[11px] font-black leading-none opacity-90">{item.rank}</span>
                  <span className="mt-1 text-[20px] font-black leading-none">{item.symbol}</span>
                  <span className="mt-1 text-[20px] font-black leading-none">{item.value}</span>
                  <span className="mt-1 text-[12px] font-bold leading-none opacity-95">{item.unit}</span>
                </TradeTrigger>
              </div>
            ))}

            <p className="absolute bottom-4 left-4 text-[11px] font-medium text-[#b19573]">
              {copy.updatedAt} {holdingCloudUpdatedAt}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title={copy.topVolume} href="/market/top-volume" moreLabel={copy.more} />

          <div className="overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <TradeTrigger
              symbol={localizedVolumeSnapshot.buy.symbol}
              className="grid w-full grid-cols-[1fr_auto] gap-4 border-b border-[#f2e7da] pb-4 text-left"
            >
              <div className="flex gap-3">
                <span className="mt-1 h-10 w-1.5 rounded-full bg-[#ffb24d]" />
                <div>
                  <p className="text-[14px] font-bold text-[#f18917]">
                    {localizedVolumeSnapshot.buy.label}
                  </p>
                  <p className="mt-1 text-[22px] font-black leading-none text-[#271910]">
                    {localizedVolumeSnapshot.buy.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#d2a06d]">
                  {localizedVolumeSnapshot.buy.amountLabel}
                </p>
                <p className="mt-1 text-[20px] font-black leading-none text-[#271910]">
                  {localizedVolumeSnapshot.buy.amount}
                </p>
              </div>
            </TradeTrigger>

            <TradeTrigger
              symbol={localizedVolumeSnapshot.sell.symbol}
              className="grid w-full grid-cols-[1fr_auto] gap-4 pt-4 text-left"
            >
              <div className="flex gap-3">
                <span className="mt-1 h-10 w-1.5 rounded-full bg-[var(--app-orange-dark)]" />
                <div>
                  <p className="text-[14px] font-bold text-[var(--app-orange-dark)]">
                    {localizedVolumeSnapshot.sell.label}
                  </p>
                  <p className="mt-1 text-[22px] font-black leading-none text-[#271910]">
                    {localizedVolumeSnapshot.sell.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#d2a06d]">
                  {localizedVolumeSnapshot.sell.amountLabel}
                </p>
                <p className="mt-1 text-[20px] font-black leading-none text-[#271910]">
                  {localizedVolumeSnapshot.sell.amount}
                </p>
              </div>
            </TradeTrigger>

            <p className="mt-4 text-[11px] font-medium text-[#b19573]">
              {copy.updatedAt} {volumeSnapshotUpdatedAt}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title={copy.weeklyFlyer} />

          <div className="flex gap-2">
            {homeWeeklyFlyers.tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveWeeklyTab(tab)}
                className={`rounded-full px-4 py-2 text-[17px] font-black leading-none ${
                  tab === resolvedActiveWeeklyTab ? "bg-[#ffe8c5] text-[#bf7210]" : "bg-[#fff5e7] text-[#c59d6c]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="pointer-events-none absolute inset-y-6 right-8 w-[120px] rotate-12 rounded-[20px] border border-[#f4eadb] bg-[#fffaf3]/80" />

            <div className="relative">
              <p className="text-[20px] font-black leading-none text-[#26180f]">
                {weeklyFeatured?.name ?? "--"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[14px] font-bold text-[#8a7053]">
                <Trophy className="h-4 w-4 text-[var(--app-orange-dark)]" />
                {weeklyFeatured?.tag ?? "--"}
              </p>

              <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
                <span className="text-[15px] font-bold text-[#9f8d78]">
                  {weeklyFeatured?.period ?? "--"}
                </span>
                <span className="text-[15px] font-bold text-[#9f8d78]">
                  {weeklyFeatured?.gainLabel ?? "--"}
                </span>
                <span className="text-[18px] font-black text-[#2c1e14]">{copy.overallChange}</span>
                <span className="text-right text-[24px] font-black leading-none text-[#2eb568]">
                  {weeklyFeatured?.gain ?? "--"}
                </span>
                <span className="text-[18px] font-black text-[#2c1e14]">
                  {weeklyFeatured?.riseLabel ?? "--"}
                </span>
                <span className="text-right text-[24px] font-black leading-none text-[#2eb568]">
                  ↑ {weeklyFeatured?.rise ?? "--"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title={copy.ranking} href="/leaderboard" moreLabel={copy.more} />

          <div className="overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="grid grid-cols-[auto_1fr_auto] items-end gap-2 border-b border-[#f0e5d8] px-4 pb-3 pt-4">
              <div>
                <p className="text-[14px] font-bold text-[#aa9781]">{copy.rankMove}</p>
                <p className="mt-1 text-[15px] font-bold text-[#aa9781]">{copy.participant}</p>
              </div>
              <div />
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-[13px] font-bold text-[#aa9781]">
                  <span>🇭🇰</span>
                  {copy.currencyHkd}
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#aa9781]">{copy.totalChange}</p>
              </div>
            </div>

            <div className="px-4">
              {homeRankingRows.map((item, index) => {
                const rankingAvatarSrc = resolveAvatarSrc(item.avatar);
                return (
                <div
                  key={`${item.rank}-${item.name}`}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 py-3 ${index !== 0 ? "border-t border-[#f5ede2]" : ""}`}
                >
                  <div className="flex w-fit items-center gap-2">
                    <RankingMedal rank={item.rank} />
                    <RankingMovement movement={item.movement} />
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    {rankingAvatarSrc ? (
                      <Image
                        src={rankingAvatarSrc}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full border border-[#f2e7da] object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#f0ece7]" />
                    )}
                    <p className="truncate text-[17px] font-black leading-none text-[#2a1b12]">
                      {item.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[16px] font-black leading-none text-[#2a1b12]">
                      {item.amount}
                    </p>
                    <p className="mt-1 text-[14px] font-black leading-none text-[#2eb568]">
                      {item.gain}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="px-4 pb-3 pt-2 text-[11px] font-medium text-[#b19573]">{copy.asOf} {rankingUpdatedAt}</div>

            <div className="pb-4">
              <div className="mx-auto flex h-6 w-14 items-center justify-center rounded-full bg-[#fff3e4] text-[#d07e0f]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="mx-1 h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
