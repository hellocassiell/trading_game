import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  Ellipsis,
  Search,
  Share2,
} from "lucide-react";

import { appMeta } from "../lib/mock-data";

type ScreenTopBarProps = {
  title?: string;
  backHref?: string;
  showBack?: boolean;
  showSearch?: boolean;
  compact?: boolean;
};

export default function ScreenTopBar({
  title = appMeta.competition,
  backHref,
  showBack = false,
  showSearch = false,
  compact = false,
}: ScreenTopBarProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[#dce5f4] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-9 items-center justify-between bg-[#4e79e8] px-2.5 text-white">
        <div className="flex items-center gap-1.5">
          {showBack ? (
            <Link
              href={backHref ?? "/"}
              className="flex h-5 w-5 items-center justify-center rounded-full text-blue-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          <div className="text-[9px] font-semibold tracking-[0.04em]">
            {appMeta.brand}
            <span className="ml-1 text-blue-100">+</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-100">
          {showSearch ? <Search className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          <Bell className="h-3.5 w-3.5" />
          <Ellipsis className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className={`border-b border-[#eaf0fa] px-2.5 ${compact ? "py-1.5" : "py-2"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="rounded-[2px] bg-[#ffefe0] px-1 py-[1px] text-[9px] font-semibold text-[#f59e0b]">
              美
            </span>
            <span className="truncate text-[10px] font-semibold text-[#606f86]">
              {title}
            </span>
          </div>
          <span className="shrink-0 text-[9px] text-[#8a94a6]">比赛介绍</span>
        </div>
      </div>
    </div>
  );
}
