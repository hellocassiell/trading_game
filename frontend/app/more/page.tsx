"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  LogOut,
} from "lucide-react";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { useLanguage, useLanguageOptions, useTranslation } from "../../components/LanguageProvider";
import { clearAuthSession } from "../../lib/adapters/auth";

const marketLinks = [
  { labelKey: "more.market.ranking", href: "/leaderboard" },
  { labelKey: "more.market.topVolume", href: "/market/top-volume" },
  { labelKey: "more.market.topHoldings", href: "/market/top-holdings" },
  { labelKey: "more.market.starTraders", href: "/ranking" },
];

function SectionBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BellRing;
  children: ReactNode;
}) {
  return (
    <SurfaceCard tone="flat" className="px-3 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff1de] text-[var(--app-orange-dark)]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-title text-[#4f3a26]">{title}</h2>
      </div>
      {children}
    </SurfaceCard>
  );
}

export default function MorePage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const languageOptions = useLanguageOptions();
  const t = useTranslation();

  return (
    <AppScreen>
      <ScreenTopBar title={t("more.pageTitle")} hideLeading />

      <div className="space-y-4 pt-2">
        <SectionBlock title={t("more.languageTitle")} icon={BellRing}>
          <p className="text-helper leading-relaxed text-[#9f8a74]">
            {t("more.languageHint")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={`rounded-[10px] px-3 py-2 text-body font-black transition ${
                  option.value === language
                    ? "bg-[var(--app-orange-dark)] text-white"
                    : "bg-[#fff8ef] text-[#b48b5e]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title={t("more.market.sectionTitle")} icon={BellRing}>
          <div className="space-y-2">
          {marketLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[56px] items-center justify-between rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5"
            >
              <span className="text-body font-medium text-[#5f4a36]">
                {t(item.labelKey)}
              </span>
              <ArrowRight className="h-4 w-4 text-[#b49a7a]" />
            </Link>
          ))}
          </div>
        </SectionBlock>

        <button
          type="button"
          onClick={() => {
            clearAuthSession();
            router.push("/guest");
          }}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#ffd9b0] bg-[#fff3e2] px-4 py-3 text-body font-black text-[var(--app-orange-dark)]"
        >
          <LogOut className="h-4 w-4" />
          {t("more.logout")}
        </button>
      </div>
    </AppScreen>
  );
}
