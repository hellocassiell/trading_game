import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ClipboardList,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { TradeTrigger } from "../../components/TradeModal";

const quickEntries = [
  {
    title: "排行榜扩展",
    description: "进入 10 大成交、20 大持仓和星级参赛者",
    href: "/market/top-volume",
    icon: Sparkles,
    tone: "from-[#fff3dc] to-[#ffe1a8] text-[#d97706]",
  },
  {
    title: "注册登录",
    description: "未登录、号码验证、邀请朋友流程",
    href: "/guest",
    icon: LogIn,
    tone: "from-[#fff1de] to-[#ffc98b] text-[#b85d0c]",
  },
] as const;

const flowLinks = [
  { label: "未登录页", href: "/guest" },
  { label: "注册入口", href: "/auth" },
  { label: "号码验证", href: "/auth/pin" },
  { label: "注册过程中离开", href: "/auth/leave-confirm" },
  { label: "邀请朋友", href: "/auth/invite" },
  { label: "账户被封锁", href: "/auth/blocked" },
];

const marketLinks = [
  { label: "今日10大成交港股", href: "/market/top-volume" },
  { label: "参赛者20大港股持仓", href: "/market/top-holdings" },
  { label: "参赛者20大失败持仓", href: "/market/top-loser-holdings" },
  { label: "星级参赛者", href: "/ranking" },
];

const tradeStateLinks = [
  { label: "0700 交易弹窗", symbol: "0700", variant: "trade" as const },
  { label: "9988 交易弹窗", symbol: "9988", variant: "trade" as const },
  { label: "0700 修改订单弹窗", symbol: "0700", variant: "order" as const },
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
    <SurfaceCard className="px-3 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff1de] text-[var(--app-orange-dark)]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-[12px] font-semibold text-[#4f5d73]">{title}</h2>
      </div>
      {children}
    </SurfaceCard>
  );
}

export default function MorePage() {
  return (
    <AppScreen>
      <ScreenTopBar title="更多" hideLeading />

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-3">
          {quickEntries.map(({ title, description, href, icon: Icon, tone }) => (
            <Link key={title} href={href} className="block">
              <SurfaceCard className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-[#4f5d73]">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-[#9aa4b3]">
                      {description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#9aa4b3]" />
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </div>

        <SectionBlock title="注册流程" icon={UserPlus}>
          <div className="space-y-2">
          {flowLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5"
            >
              <span className="text-[11px] font-medium text-[#5f6c80]">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8fa0b6]" />
            </Link>
          ))}
          </div>
        </SectionBlock>

        <SectionBlock title="榜单与页面" icon={BellRing}>
          <div className="space-y-2">
          {marketLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5"
            >
              <span className="text-[11px] font-medium text-[#5f6c80]">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8fa0b6]" />
            </Link>
          ))}
          </div>
        </SectionBlock>

        <SectionBlock title="交易状态" icon={ClipboardList}>
          <div className="space-y-2">
          {tradeStateLinks.map((item) => (
            <TradeTrigger
              key={`${item.symbol}-${item.variant}`}
              symbol={item.symbol}
              variant={item.variant}
              className="flex items-center justify-between rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5"
            >
              <span className="text-[11px] font-medium text-[#5f6c80]">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8fa0b6]" />
            </TradeTrigger>
          ))}
          </div>
        </SectionBlock>
      </div>
    </AppScreen>
  );
}
