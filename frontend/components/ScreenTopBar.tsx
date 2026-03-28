import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  Menu,
  Search,
} from "lucide-react";

import { appMeta } from "../lib/mock-data";

type ScreenTopBarProps = {
  title?: string;
  backHref?: string;
  showBack?: boolean;
  showSearch?: boolean;
  compact?: boolean;
  hideLeading?: boolean;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideMetaRow?: boolean;
  hideTrailing?: boolean;
};

export default function ScreenTopBar({
  title = appMeta.competition,
  backHref,
  showBack = false,
  showSearch = false,
  compact = false,
  hideLeading = false,
  hideTitle = false,
  hideSubtitle = false,
  hideMetaRow = false,
  hideTrailing = false,
}: ScreenTopBarProps) {
  const minimalHeader = hideLeading && hideTitle;
  const shellClass = minimalHeader
    ? "sticky top-0 z-20 -mx-[var(--app-gutter)] mb-3 overflow-hidden bg-[linear-gradient(180deg,#ffb45a_0%,var(--app-orange)_56%,var(--app-orange-dark)_100%)] px-[var(--app-gutter)] pb-2 pt-[max(env(safe-area-inset-top),10px)] text-white shadow-[0_12px_24px_rgba(171,86,0,0.16)]"
    : "sticky top-0 z-20 -mx-[var(--app-gutter)] mb-3 overflow-hidden rounded-b-[24px] bg-[linear-gradient(180deg,#ffb45a_0%,var(--app-orange)_56%,var(--app-orange-dark)_100%)] px-[var(--app-gutter)] pb-2 pt-[max(env(safe-area-inset-top),10px)] text-white shadow-[0_12px_24px_rgba(171,86,0,0.16)]";

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between">
        {hideLeading ? (
          <div className={minimalHeader ? "h-0 w-0" : "h-8 w-8"} />
        ) : showBack ? (
          <Link
            href={backHref ?? "/"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white active:bg-white/20"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white active:bg-white/20"
            aria-label="菜单"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        )}

        <div className={`flex flex-1 flex-col items-center ${minimalHeader ? "px-0" : "px-3"}`}>
          {!hideTitle ? (
            <span className="text-[12px] font-black leading-none text-white">{title}</span>
          ) : (
            <span className={minimalHeader ? "hidden" : "h-[11px]"} />
          )}
          {!compact && !hideTitle && !hideSubtitle ? (
            <span className="mt-1 text-[8px] font-medium leading-none tracking-[0.12em] text-white/78">
              {appMeta.brand} x {appMeta.sponsor}
            </span>
          ) : null}
        </div>

        {hideTrailing ? (
          <div className="h-8 w-8" />
        ) : (
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white active:bg-white/20"
            aria-label={showSearch ? "搜索" : "通知"}
          >
            {showSearch ? (
              <Search className="h-4.5 w-4.5" />
            ) : (
              <>
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#fff3df]" />
              </>
            )}
          </button>
        )}
      </div>

      {!compact && !minimalHeader && !hideMetaRow ? (
        <div className="mt-2 flex items-center justify-between text-[9px] text-white/78">
            <span>港股模拟投资比赛</span>
            <span>04 MAY 2021</span>
        </div>
      ) : null}
    </div>
  );
}
