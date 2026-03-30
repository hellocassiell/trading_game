import Link from "next/link";
import { Bell, Trophy, UserRound } from "lucide-react";

type ProfileSummaryData = {
  nickname: string;
  rank: number;
  rankDelta: number;
  dailyTradesRemaining: number;
  weeklyTradesRequired: number;
  weeklyTradesRemaining: number;
  initialCapital: string;
  bonusAmount: string;
  portfolioValue: string;
  availableCash: string;
  totalAssets: string;
  updatedAt: string;
};

type ProfileSummaryCardProps = {
  href?: string;
  className?: string;
  summary?: ProfileSummaryData;
};

export default function ProfileSummaryCard({
  href,
  className = "",
  summary,
}: ProfileSummaryCardProps) {
  const resolvedSummary = summary ?? {
    nickname: "Joey Cheung",
    rank: 91,
    rankDelta: 12,
    dailyTradesRemaining: 16,
    weeklyTradesRequired: 4,
    weeklyTradesRemaining: 2,
    initialCapital: "HK$ 1,000,000.00",
    bonusAmount: "HK$ 0.00",
    portfolioValue: "HK$ 0.00",
    availableCash: "HK$ 1,000,000.00",
    totalAssets: "HK$ 1,000,000.00",
    updatedAt: "2026-04-21T22:00:00+08:00",
  };

  const content = (
    <div
      className={`overflow-hidden bg-[linear-gradient(180deg,#ffb85f_0%,#ff9523_56%,#db7400_100%)] px-4 pb-5 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_18px_34px_rgba(171,86,0,0.16)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-body font-black tracking-[0.03em]">
          <span>AASTOCKS</span>
          <span className="text-label opacity-85">↗</span>
        </div>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffe06a]" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] bg-white text-[#5a4733] shadow-[0_18px_32px_rgba(171,86,0,0.14)]">
        <div className="px-4 pb-3 pt-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ece7de]">
              <UserRound className="h-7 w-7 text-[#d7d0c7]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-title font-black text-[#31343a]">{resolvedSummary.nickname}</p>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff4de] px-2.5 py-1 text-label font-black text-[#d97a00]">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>排名 {resolvedSummary.rank}</span>
                  <span className="text-[var(--app-green)]">↑ {resolvedSummary.rankDelta}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-helper leading-5">
                <span className="text-[#7f7364]">每天可供交易次数</span>
                <span className="font-black text-[#5c4a37]">尚馀 {resolvedSummary.dailyTradesRemaining}次</span>
                <span className="text-[#7f7364]">每周需交易{resolvedSummary.weeklyTradesRequired}次</span>
                <span className="font-black text-[#d9534f]">尚欠 {resolvedSummary.weeklyTradesRemaining}次</span>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-[#f1e6d9] pt-3">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body leading-6">
              <span className="text-[#8e7d67]">起始资金</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.initialCapital}</span>
              <span className="text-[#8e7d67]">额外奖赏</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.bonusAmount}</span>
              <span className="text-[#8e7d67]">证券参考市值</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.portfolioValue}</span>
              <span className="text-[#8e7d67]">可投资余额</span>
              <span className="font-black text-[#ef7c00]">{resolvedSummary.availableCash}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f5ebdf] px-4 pb-4 pt-3">
          <p className="text-helper font-black text-[#ef7c00]">资产总值</p>
          <p className="mt-1 text-page font-black text-[#ef7c00]">{resolvedSummary.totalAssets}</p>

          <div className="relative mt-3 rounded-[16px] bg-[linear-gradient(180deg,#fffdf9,#fff4e5)] px-3 pb-8 pt-3">
            <svg className="h-[82px] w-full" viewBox="0 0 300 82" preserveAspectRatio="none">
              <path
                d="M 10 62 C 48 60, 84 58, 118 36 S 190 20, 224 12 S 262 10, 286 8"
                fill="none"
                stroke="#ef7c00"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="10" cy="62" r="4.5" fill="#ef7c00" />
              <circle cx="76" cy="60" r="4.5" fill="#ef7c00" />
              <circle cx="146" cy="36" r="4.5" fill="#ef7c00" />
              <circle cx="214" cy="14" r="4.5" fill="#ef7c00" />
              <circle cx="286" cy="8" r="4.5" fill="#ef7c00" />
            </svg>
            <div className="absolute inset-x-3 bottom-3 flex justify-between text-label font-semibold text-[#b1a191]">
              <span>26/04</span>
              <span>27/04</span>
              <span>28/04</span>
              <span>29/04</span>
              <span>今日</span>
            </div>
          </div>

          <p className="mt-3 text-label text-[#baa58d]">资料更新 {resolvedSummary.updatedAt}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        <h3 className="text-page font-black">港股持仓</h3>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/16 px-3 py-1.5 text-label font-bold">
          <span>🇭🇰</span>
          <span>货币 (港元)</span>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
