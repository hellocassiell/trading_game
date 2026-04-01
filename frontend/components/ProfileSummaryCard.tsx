"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Trophy, UserRound } from "lucide-react";

import { useTranslation } from "./LanguageProvider";
import { resolveAvatarSrc } from "../lib/avatar";

type ProfileSummaryData = {
  nickname: string;
  avatar?: string;
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
  trendLabels: string[];
  trendValues: number[];
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
  const t = useTranslation();
  const resolvedSummary = summary ?? {
    nickname: "Joey Cheung",
    avatar: "",
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
    updatedAt: "2026/04/21 22:00 HKT",
    trendLabels: ["26/04", "27/04", "28/04", "29/04", t("profile.today")],
    trendValues: [930000, 956000, 975000, 1000000, 1000000],
  };
  const avatarSrc = resolveAvatarSrc(resolvedSummary.avatar);
  const xPoints = [10, 76, 146, 214, 286];
  const trendMin = Math.min(...resolvedSummary.trendValues);
  const trendMax = Math.max(...resolvedSummary.trendValues);
  const span = Math.max(1, trendMax - trendMin);
  const yForValue = (value: number) => 62 - ((value - trendMin) / span) * 54;
  const trendPath = xPoints
    .map((x, index) => `${index === 0 ? "M" : "L"} ${x} ${yForValue(resolvedSummary.trendValues[index] ?? trendMin)}`)
    .join(" ");

  const content = (
    <div
      className={`overflow-hidden bg-[linear-gradient(180deg,#ffb85f_0%,#ff9523_56%,#db7400_100%)] px-4 pb-5 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_18px_34px_rgba(171,86,0,0.16)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-body font-black tracking-[0.03em]">
          <span>{t("profile.brandName")}</span>
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
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={resolvedSummary.nickname}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <UserRound className="h-7 w-7 text-[#d7d0c7]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-title font-black text-[#31343a]">{resolvedSummary.nickname}</p>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff4de] px-2.5 py-1 text-label font-black text-[#d97a00]">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>
                    {t("profile.rankLabel")} {resolvedSummary.rank}
                  </span>
                  <span className="text-[var(--app-green)]">↑ {resolvedSummary.rankDelta}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-helper leading-5">
                <span className="text-[#7f7364]">{t("profile.dailyTrades")}</span>
                <span className="font-black text-[#5c4a37]">
                  {t("profile.dailyTradesRemainingPrefix")} {resolvedSummary.dailyTradesRemaining}
                  {t("profile.timesSuffix")}
                </span>
                <span className="text-[#7f7364]">
                  {t("profile.weeklyTradesPrefix")}
                  {resolvedSummary.weeklyTradesRequired}
                  {t("profile.timesSuffix")}
                </span>
                <span className="font-black text-[#d9534f]">
                  {t("profile.weeklyTradesRemainingPrefix")} {resolvedSummary.weeklyTradesRemaining}
                  {t("profile.timesSuffix")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-[#f1e6d9] pt-3">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body leading-6">
              <span className="text-[#8e7d67]">{t("profile.initialCapital")}</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.initialCapital}</span>
              <span className="text-[#8e7d67]">{t("profile.bonus")}</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.bonusAmount}</span>
              <span className="text-[#8e7d67]">{t("profile.portfolioValue")}</span>
              <span className="font-black text-[#3f3b34]">{resolvedSummary.portfolioValue}</span>
              <span className="text-[#8e7d67]">{t("profile.availableCash")}</span>
              <span className="font-black text-[#ef7c00]">{resolvedSummary.availableCash}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f5ebdf] px-4 pb-4 pt-3">
          <p className="text-helper font-black text-[#ef7c00]">{t("profile.totalAssets")}</p>
          <p className="mt-1 text-page font-black text-[#ef7c00]">{resolvedSummary.totalAssets}</p>

          <div className="relative mt-3 rounded-[16px] bg-[linear-gradient(180deg,#fffdf9,#fff4e5)] px-3 pb-8 pt-3">
            <svg className="h-[82px] w-full" viewBox="0 0 300 82" preserveAspectRatio="none">
              <path
                d={trendPath}
                fill="none"
                stroke="#ef7c00"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              {xPoints.map((x, index) => (
                <circle
                  key={`${x}-${index}`}
                  cx={x}
                  cy={yForValue(resolvedSummary.trendValues[index] ?? trendMin)}
                  r="4.5"
                  fill="#ef7c00"
                />
              ))}
            </svg>
            <div className="absolute inset-x-3 bottom-3 flex justify-between text-label font-semibold text-[#b1a191]">
              {resolvedSummary.trendLabels.map((label, index) => (
                <span key={`${label}-${index}`}>
                  {index === resolvedSummary.trendLabels.length - 1 ? t("profile.today") : label}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 text-label text-[#baa58d]">
            {t("profile.updatedAtPrefix")} {resolvedSummary.updatedAt}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        <h3 className="text-page font-black">{t("profile.holdingsTitle")}</h3>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/16 px-3 py-1.5 text-label font-bold">
          <span>🇭🇰</span>
          <span>{t("profile.currencyLabel")}</span>
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
