"use client";

import { ChevronLeft, Menu, Trophy } from "lucide-react";
import { byLanguage } from "../lib/locale";
import { useLanguage } from "./LanguageProvider";

type HeaderProps = {
  title?: string;
};

export default function Header({
  title,
}: HeaderProps) {
  const { language } = useLanguage();
  const copy = byLanguage(language, {
    "zh-Hant": { title: "智財港股投資大賽", back: "返回", menu: "選單" },
    "zh-Hans": { title: "智财港股投资大赛", back: "返回", menu: "菜单" },
    en: { title: "HK Stock Trading Game", back: "Back", menu: "Menu" },
  });

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-[linear-gradient(180deg,var(--app-orange),var(--app-orange-dark))] px-4 text-white shadow-sm">
      <button
        type="button"
        aria-label={copy.back}
        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2 px-2">
        <Trophy className="h-4 w-4 shrink-0 text-[#fff1db]" />
        <h1 className="truncate text-sm font-semibold tracking-wide">
          {title ?? copy.title}
        </h1>
      </div>

      <button
        type="button"
        aria-label={copy.menu}
        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
