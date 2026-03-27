import Link from "next/link";
import { Search } from "lucide-react";

import AppScreen from "../../../components/AppScreen";
import ScreenTopBar from "../../../components/ScreenTopBar";
import SurfaceCard from "../../../components/SurfaceCard";
import { assistantResults } from "../../../lib/mock-data";

export default function AssistantResultsPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="Guess List" showSearch compact />

      <SurfaceCard className="overflow-hidden px-0 py-0">
        <div className="px-2.5 py-2">
          <div className="flex items-center rounded-[4px] border border-[#d7e6ff] bg-[#fafcff] px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-[#75a0ff]" />
            <span className="ml-1.5 text-[9px] font-medium text-[#4976e8]">A</span>
          </div>

          <div className="mt-2 rounded-[4px] border border-[#edf1f8] bg-white">
            {assistantResults.map((item, index) => (
              <Link
                key={`${item.symbol}-${item.code}`}
                href={`/trade/${index === 0 ? "AAPL" : item.code}`}
                className={`grid grid-cols-[1fr_auto] items-center px-2 py-1.5 ${
                  index % 2 === 0 ? "bg-[#f7fbff]" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#ef4444]">●</span>
                  <span className="text-[9px] text-[#5f6c80]">{item.symbol}</span>
                </div>
                <span className="text-[8px] text-[#75a0ff]">{item.code}</span>
              </Link>
            ))}
          </div>
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}
