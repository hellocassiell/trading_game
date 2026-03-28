import Link from "next/link";
import { ArrowRightLeft, ChevronRight, TrendingUp } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import MarketTable from "../../components/MarketTable";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import SubTabs from "../../components/SubTabs";
import {
  loserHoldings,
  topHoldings,
  topVolume,
} from "../../lib/mock-data";

export default function QuotesPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="报价中心" showBack backHref="/" />

      <div className="space-y-4 pt-4">
      <SurfaceCard className="px-3 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">恒生指数</p>
            <p className="mt-1 text-[13px] font-bold text-[#ef4444]">17,632</p>
            <p className="text-[9px] text-[#ef4444]">+1.08%</p>
          </div>
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">国企指数</p>
            <p className="mt-1 text-[13px] font-bold text-[#22c55e]">6,158</p>
            <p className="text-[9px] text-[#22c55e]">-0.34%</p>
          </div>
          <div className="rounded-[10px] bg-[#fff9f2] px-3 py-2.5">
            <p className="text-[9px] text-[#9aa4b3]">成交额</p>
            <p className="mt-1 text-[13px] font-bold text-[var(--app-orange-dark)]">1,289亿</p>
            <p className="text-[9px] text-[#8fa0b6]">截至 16:00</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff1de] text-[var(--app-orange-dark)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-[12px] font-semibold text-[#4f5d73]">热门榜单</p>
          </div>
          <Link href="/more" className="flex items-center gap-0.5 text-[10px] text-[var(--app-orange-dark)]">
            更多
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <SubTabs
          tabs={[
            { label: "10大成交", active: true, href: "/market/top-volume" },
            { label: "20大持仓", href: "/market/top-holdings" },
            { label: "失败持仓", href: "/market/top-loser-holdings" },
          ]}
        />
      </SurfaceCard>

      <MarketTable
        headerLeft="10大成交港股"
        headerRight="金额"
        rows={topVolume.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          value: item.price,
          delta: item.delta,
        }))}
      />

      <SurfaceCard className="px-3 py-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff5e8] text-[#d97706]">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <p className="text-[12px] font-semibold text-[#4f5d73]">参赛者持仓观察</p>
        </div>
        <div className="space-y-2">
          <Link href="/market/top-holdings" className="block rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#4f5d73]">参赛者20大港股持仓</p>
                <p className="mt-0.5 text-[9px] text-[#a3acb9]">
                  龙头股：{topHoldings[0].symbol} {topHoldings[0].value}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8fa0b6]" />
            </div>
          </Link>
          <Link href="/market/top-loser-holdings" className="block rounded-[10px] border border-[#f1e8dd] bg-[#fffdf9] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#4f5d73]">参赛者20大失败持仓</p>
                <p className="mt-0.5 text-[9px] text-[#a3acb9]">
                  观察风险股：{loserHoldings[0].symbol} {loserHoldings[0].loss}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8fa0b6]" />
            </div>
          </Link>
        </div>
      </SurfaceCard>
      </div>
    </AppScreen>
  );
}
