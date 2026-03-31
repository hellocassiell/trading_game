"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRing,
  LogOut,
  Sparkles,
} from "lucide-react";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { useLanguage, useLanguageOptions, useTranslation } from "../../components/LanguageProvider";
import { clearAuthSession, readAuthSession } from "../../lib/adapters/auth";

const quickEntries = [
  {
    titleKey: "more.quickEntry.rank.title",
    descriptionKey: "more.quickEntry.rank.desc",
    href: "/market/top-volume",
    icon: Sparkles,
    tone: "from-[#fff3dc] to-[#ffe1a8] text-[#d97706]",
  },
] as const;

const marketLinks = [
  { labelKey: "more.market.topVolume", href: "/market/top-volume" },
  { labelKey: "more.market.topHoldings", href: "/market/top-holdings" },
  { labelKey: "more.market.topLoserHoldings", href: "/market/top-loser-holdings" },
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
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = readAuthSession();
    const loggedIn = Boolean(session?.userId || session?.phone);
    if (!loggedIn) {
      router.replace("/guest");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <AppScreen>
      <ScreenTopBar title={t("more.pageTitle")} hideLeading />

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-3">
          {quickEntries.map(({ titleKey, descriptionKey, href, icon: Icon, tone }) => (
            <Link key={titleKey} href={href} className="block">
              <SurfaceCard tone="flat" className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-black text-[#4f3a26]">
                      {t(titleKey)}
                    </p>
                    <p className="mt-0.5 text-helper leading-relaxed text-[#9f8a74]">
                      {t(descriptionKey)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#b49a7a]" />
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </div>

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
