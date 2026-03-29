"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { clearAuthSession } from "../../lib/adapters/auth";

const quickEntries = [
  {
    title: "排行榜扩展",
    description: "进入 10 大成交、20 大持仓和星级参赛者",
    href: "/market/top-volume",
    icon: Sparkles,
    tone: "from-[#fff3dc] to-[#ffe1a8] text-[#d97706]",
  },
] as const;

const marketLinks = [
  { label: "今日10大成交港股", href: "/market/top-volume" },
  { label: "参赛者20大港股持仓", href: "/market/top-holdings" },
  { label: "参赛者20大失败持仓", href: "/market/top-loser-holdings" },
  { label: "星级参赛者", href: "/ranking" },
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

  return (
    <AppScreen>
      <ScreenTopBar title="更多" hideLeading />

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-3">
          {quickEntries.map(({ title, description, href, icon: Icon, tone }) => (
            <Link key={title} href={href} className="block">
              <SurfaceCard tone="flat" className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-black text-[#4f3a26]">{title}</p>
                    <p className="mt-0.5 text-helper leading-relaxed text-[#9f8a74]">
                      {description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#b49a7a]" />
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </div>

        <SectionBlock title="榜单与页面" icon={BellRing}>
          <div className="space-y-2">
          {marketLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[56px] items-center justify-between rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5"
            >
              <span className="text-body font-medium text-[#5f4a36]">{item.label}</span>
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
          退出登录
        </button>
      </div>
    </AppScreen>
  );
}
