"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, UserRound } from "lucide-react";

import SurfaceCard from "./SurfaceCard";
import { tradingApiClient } from "../lib/api";
import { byLanguage } from "../lib/locale";
import { useLanguage } from "./LanguageProvider";

type RankingRow = {
  rank: string;
  name: string;
  amount: string;
  gain: string;
  current?: boolean;
};

function formatCurrency(value: number) {
  return `HK$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toFixed(2)}%`;
}

export default function RankingBoard() {
  const { language } = useLanguage();
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([]);
  const copy = byLanguage(language, {
    "zh-Hant": { totalAssets: "總資產" },
    "zh-Hans": { totalAssets: "总资产" },
    en: { totalAssets: "Total Assets" },
  });

  useEffect(() => {
    let cancelled = false;
    async function loadRankings() {
      try {
        const payload = await tradingApiClient.getRankingsLeaderboard(1, 6);
        const rows = (payload.items ?? []).map((item) => ({
          rank: String(item.rank),
          name: item.nickname,
          amount: formatCurrency(item.totalAssets),
          gain: formatPercent(item.changePercent),
          current: Boolean(item.isCurrentUser),
        }));
        if (!cancelled) {
          setRankingRows(rows);
        }
      } catch {
        if (!cancelled) {
          setRankingRows([]);
        }
      }
    }
    void loadRankings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SurfaceCard className="space-y-2 px-3 py-3">
      {rankingRows.map((item, index) => (
        <Link
          key={`${item.rank}-${item.name}`}
          href={"current" in item && item.current ? "/profile" : "/ranking"}
          className={`flex items-center justify-between rounded-[18px] border px-3 py-2.5 ${
            "current" in item && item.current
              ? "border-[#f4d8b8] bg-[#fff4e5]"
              : "border-[#f5ece2] bg-[#fffdf9]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                index === 0
                  ? "bg-[#fff3d1] text-[#d18a00]"
                  : index < 3
                    ? "bg-[#fbf3ea] text-[#8f7358]"
                    : "bg-[#f9f2e9] text-[#b19880]"
              }`}
            >
              {index === 0 ? <Crown className="h-4 w-4" /> : item.rank}
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                "current" in item && item.current
                  ? "bg-[linear-gradient(180deg,#ffb45c_0%,#f38b1b_100%)] text-white"
                  : "bg-[#f9f1e7] text-[#aa9075]"
              }`}
            >
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#48566b]">
                {item.name}
              </p>
              <p className="text-[12px] text-[var(--app-text-muted)]">
                {copy.totalAssets} {item.amount}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[15px] font-semibold text-[#46546a]">{item.amount}</p>
            <p className="text-[13px] font-semibold text-[var(--app-green)]">{item.gain}</p>
          </div>
        </Link>
      ))}
    </SurfaceCard>
  );
}
