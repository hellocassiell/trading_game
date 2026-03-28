import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import { TradeTrigger } from "../../../components/TradeModal";
import { getTopHoldingsPageData } from "../../../lib/adapters/ranking";

function trendColor(delta: string) {
  if (delta === "▲") {
    return "text-[#2eb568]";
  }
  if (delta === "▼") {
    return "text-[#ef5b52]";
  }

  return "text-[#d8d8d8]";
}

export default function TopHoldingsPage() {
  const { status, rows: topHoldings, updatedAt } = getTopHoldingsPageData();

  if (status === "error") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-[18px] font-black text-[#2a1b12]">持仓榜单加载失败</p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen className="!px-0">
      <div className="min-h-full overflow-hidden bg-white">
        <div className="overflow-hidden bg-[linear-gradient(180deg,#ffb65c_0%,#ff9421_58%,#db7200_100%)] px-4 pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_12px_28px_rgba(171,86,0,0.16)]">
          <div className="flex items-center gap-1 pb-5">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label="返回"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-[18px] font-black">参赛者20大港股持仓</h1>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center border-b border-[#ece3d8] px-4 py-2.5 text-[12px] font-semibold text-[#b3a79b]">
          <span>代號及名稱</span>
          <span>持倉總額/變動</span>
        </div>

        <div className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute bottom-[-16px] left-[22px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#f7f2ea] opacity-90">
            A
          </div>
          <div className="pointer-events-none absolute bottom-[-24px] right-[18px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#f8f3eb] opacity-90">
            A
          </div>

          <div className="relative">
            {topHoldings.map((item, index) => (
              <TradeTrigger
                key={`${item.symbol}-${index}`}
                symbol={item.symbol}
                className="grid min-h-[52px] w-full grid-cols-[1fr_auto] items-center border-b border-[#f1e8dd] px-4 py-3 text-left active:bg-[#fffaf4]"
              >
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="shrink-0 text-[18px] font-black leading-none text-[#2f2f31]">
                    {item.symbol}
                  </span>
                  <span className="truncate text-[17px] font-bold leading-none text-[#3e4045]">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <span className="whitespace-nowrap text-[17px] font-black leading-none text-[#2f2f31]">
                    {item.value}
                  </span>
                  <span className={`text-[22px] font-black leading-none ${trendColor(item.delta)}`}>
                    {item.delta === "▲" ? "↑" : item.delta === "▼" ? "↓" : "–"}
                  </span>
                </div>
              </TradeTrigger>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 text-[11px] text-[#b5a89a]">
          最後更新 {updatedAt}
        </div>
      </div>
    </AppScreen>
  );
}
