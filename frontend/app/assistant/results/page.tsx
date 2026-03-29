import Link from "next/link";
import { Search } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import ScreenTopBar from "../../../components/ScreenTopBar";
import SurfaceCard from "../../../components/SurfaceCard";
import { TradeTrigger } from "../../../components/TradeModal";
import { assistantResults } from "../../../lib/mock-data";

export default function AssistantResultsPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="搜索结果" showBack backHref="/more" showSearch compact />

      <div className="pt-4">
      <SurfaceCard className="overflow-hidden px-0 py-0">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between gap-2 rounded-[10px] border border-[#f4d8b8] bg-[#fffaf4] px-3 py-2">
            <div className="flex min-w-0 items-center">
              <Search className="h-3.5 w-3.5 text-[var(--app-orange)]" />
              <span className="ml-2 text-[10px] font-medium text-[var(--app-orange-dark)]">A</span>
            </div>
            <Link href="/more" className="shrink-0 text-[9px] text-[var(--app-orange-dark)]">
              返回
            </Link>
          </div>

          <div className="mt-3 rounded-[10px] border border-[#f1e8dd] bg-white">
            {assistantResults.map((item, index) => (
              <TradeTrigger
                key={`${item.symbol}-${item.code}`}
                symbol={item.code}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-dashed border-[#f1e8dd] px-3 py-2 last:border-b-0 ${
                  index === 0 ? "bg-[#fff8ef]" : index % 2 === 0 ? "bg-[#fffdf9]" : ""
                }`}
              >
                <span className="text-[10px] text-[#ef4444]">●</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#5f6c80]">{item.symbol}</span>
                  {index === 0 ? (
                    <span className="rounded-full bg-[#fff1de] px-1.5 py-0.5 text-[8px] font-bold text-[var(--app-orange-dark)]">
                      匹配
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] font-medium text-[var(--app-orange-dark)]">{item.code}</span>
              </TradeTrigger>
            ))}
          </div>
        </div>

      </SurfaceCard>
      </div>
    </AppScreen>
  );
}
