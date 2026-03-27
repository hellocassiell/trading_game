import Link from "next/link";
import { UserRound } from "lucide-react";

import SurfaceCard from "./SurfaceCard";
import { rankingList } from "../lib/mock-data";

export default function RankingBoard() {
  return (
    <SurfaceCard className="px-2.5 py-1.5">
      {rankingList.map((item, index) => (
        <Link
          key={`${item.rank}-${item.name}`}
          href={item.current ? "/profile" : "/ranking"}
          className={`flex items-center justify-between rounded-[4px] px-1.5 py-1.5 ${
            item.current ? "bg-[#eef5ff]" : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-bold ${
                index < 3
                  ? "bg-[#fff1cf] text-[#f59e0b]"
                  : "bg-[#f1f5f9] text-[#7c8798]"
              }`}
            >
              {item.rank}
            </div>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                item.current
                  ? "bg-gradient-to-br from-[#6b93ff] to-[#2b5ce5] text-white"
                  : "bg-[#eef1f6] text-[#a3acb9]"
              }`}
            >
              <UserRound className="h-3 w-3" />
            </div>
            <p className="truncate text-[10px] font-medium text-[#5f6c80]">
              {item.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-[#5f6c80]">
              {item.amount}
            </p>
            <p className="text-[8px] text-[#22c55e]">{item.gain}</p>
          </div>
        </Link>
      ))}
    </SurfaceCard>
  );
}
