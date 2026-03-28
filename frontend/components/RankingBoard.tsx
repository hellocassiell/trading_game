import Link from "next/link";
import { Crown, UserRound } from "lucide-react";

import SurfaceCard from "./SurfaceCard";
import { rankingList } from "../lib/mock-data";

export default function RankingBoard() {
  return (
    <SurfaceCard className="space-y-2 px-3 py-3">
      {rankingList.map((item, index) => (
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
                总资产 {item.amount}
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
