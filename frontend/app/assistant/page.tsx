import Link from "next/link";
import { Search } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import FakeKeyboard from "../../components/FakeKeyboard";
import ScreenTopBar from "../../components/ScreenTopBar";
import SurfaceCard from "../../components/SurfaceCard";
import { assistantResults } from "../../lib/mock-data";

export default function AssistantPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="Guess List" showSearch compact />

      <SurfaceCard className="overflow-hidden px-0 py-0">
        <div className="px-2.5 py-2">
          <div className="flex items-center rounded-[4px] border border-[#e6edf8] bg-[#fafcff] px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-[#b0b8c5]" />
            <span className="ml-1.5 text-[9px] text-[#b0b8c5]">
              输入股票名称或代号，例如 A
            </span>
          </div>

          <div className="mt-2 rounded-[4px] border border-[#edf1f8] bg-white">
            {assistantResults.map((item) => (
              <Link
                key={`${item.symbol}-${item.code}`}
                href={`/trade/${item.code}`}
                className="grid grid-cols-[1fr_auto] items-center border-b border-dashed border-[#edf1f8] px-2 py-1.5 last:border-b-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#ef4444]">●</span>
                  <span className="text-[9px] text-[#5f6c80]">{item.symbol}</span>
                </div>
                <span className="text-[8px] text-[#adb7c5]">{item.code}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/assistant/results"
            className="mt-2 inline-flex rounded-full bg-[#edf4ff] px-2 py-1 text-[8px] font-semibold text-[#4976e8]"
          >
            切换到已输入 A 的结果页
          </Link>
        </div>

        <FakeKeyboard />
      </SurfaceCard>
    </AppScreen>
  );
}
