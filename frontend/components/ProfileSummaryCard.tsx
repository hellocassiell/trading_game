import Link from "next/link";
import { Star, Trophy, UserRound } from "lucide-react";

import MiniLineChart from "./MiniLineChart";
import SurfaceCard from "./SurfaceCard";
import { portfolioSummary, profile } from "../lib/mock-data";

type ProfileSummaryCardProps = {
  href?: string;
  showStar?: boolean;
  showHoldings?: boolean;
  className?: string;
  assetLabel?: string;
  totalUsd?: string;
  totalHkd?: string;
};

export default function ProfileSummaryCard({
  href,
  showStar = false,
  showHoldings = true,
  className = "",
  assetLabel = "总资产金额",
  totalUsd = `${profile.totalAssetsUsd} 美元`,
  totalHkd = `${profile.portfolioUsd} 港元`,
}: ProfileSummaryCardProps) {
  const content = (
    <SurfaceCard className={className}>
      <div className="flex items-start gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef1f6] text-[#a6afbc]">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-[11px] font-semibold text-[#4f5d73]">
                  {profile.name}
                </p>
                <Trophy className="h-3 w-3 text-[#f6b53b]" />
                {showStar ? <Star className="h-3 w-3 text-[#4f79e8]" /> : null}
              </div>
              <p className="mt-0.5 truncate text-[8px] text-[#b0b8c5]">
                {profile.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] text-[#b0b8c5]">排名</p>
              <p className="text-[10px] font-semibold text-[#707c8f]">
                {profile.ranking}
              </p>
              <p className="text-[8px] text-[#b0b8c5]">2 次</p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
            {portfolioSummary.map((item) => (
              <div key={item.label}>
                <p className="text-[8px] text-[#adb7c5]">{item.label}</p>
                <p className="truncate text-[9px] font-semibold text-[#657285]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {showHoldings ? (
            <div className="mt-2 flex items-end justify-between rounded-[4px] bg-[#fbfdff] px-2 py-1.5">
              <div>
                <p className="text-[8px] text-[#adb7c5]">{assetLabel}</p>
                <p className="text-[11px] font-bold leading-tight text-[#4772e8]">
                  {totalUsd}
                </p>
                <p className="text-[11px] font-bold leading-tight text-[#4772e8]">
                  {totalHkd}
                </p>
              </div>
              <MiniLineChart />
            </div>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
