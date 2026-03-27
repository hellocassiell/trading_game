import Link from "next/link";

import AppScreen from "../../components/AppScreen";
import MiniLineChart from "../../components/MiniLineChart";
import ProfileSummaryCard from "../../components/ProfileSummaryCard";
import RankingBoard from "../../components/RankingBoard";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { positions } from "../../lib/mock-data";

export default function RankingPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="星级参赛者" showBack backHref="/" />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: "总资产", active: true },
            { label: "今日" },
            { label: "本周" },
            { label: "本月" },
          ]}
        />

        <div className="mt-2 rounded-[4px] bg-[#fbfdff] p-2">
          <ProfileSummaryCard
            showStar
            showHoldings={false}
            className="border-0 bg-transparent px-0 py-0 shadow-none"
          />
          <div className="mt-2 flex items-end justify-between rounded-[4px] bg-white px-2 py-1.5">
            <div>
              <p className="text-[8px] text-[#adb7c5]">总资产金额</p>
              <p className="text-[11px] font-semibold text-[#5f6c80]">513,910.00</p>
              <p className="text-[11px] font-semibold text-[#4772e8]">947,321.40</p>
            </div>
            <div className="flex items-end gap-2">
              <MiniLineChart wide />
              <p className="pb-1 text-[8px] text-[#22c55e]">+11.2%</p>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {positions.map((item) => (
            <Link
              key={item.symbol}
              href={`/trade/${item.symbol}`}
              className="block border-t border-dashed border-[#edf1f8] pt-1.5 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#4f5d73]">
                    {item.symbol}
                  </p>
                  <p className="text-[8px] text-[#adb7c5]">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#4772e8]">
                    {item.price}
                  </p>
                  <p
                    className={`text-[8px] ${
                      item.positive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {item.pnl}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SurfaceCard>

      <RankingBoard />
    </AppScreen>
  );
}
