"use client";

import { ChevronLeft, Menu, Trophy } from "lucide-react";

type HeaderProps = {
  title?: string;
};

export default function Header({
  title = "智财美股投资大赛",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-blue-600 px-4 text-white shadow-sm">
      <button
        type="button"
        aria-label="返回"
        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2 px-2">
        <Trophy className="h-4 w-4 shrink-0 text-blue-100" />
        <h1 className="truncate text-sm font-semibold tracking-wide">
          {title}
        </h1>
      </div>

      <button
        type="button"
        aria-label="菜单"
        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
