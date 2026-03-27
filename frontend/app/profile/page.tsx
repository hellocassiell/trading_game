import Link from "next/link";
import { ChevronRight } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import ProfileSummaryCard from "../../components/ProfileSummaryCard";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { positions } from "../../lib/mock-data";

export default function ProfilePage() {
  return (
    <AppScreen>
      <ScreenTopBar title="个人" showBack backHref="/" />

      <ProfileSummaryCard />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: "持仓证券", active: true },
            { label: "成交纪录" },
          ]}
        />

        <div className="mt-2 space-y-1.5">
          {positions.map((item) => (
            <Link
              key={item.symbol}
              href={`/trade/${item.symbol}`}
              className="block rounded-[4px] border border-[#edf1f8] bg-[#fbfdff] px-2 py-1.5"
            >
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-semibold text-[#4f5d73]">
                      {item.symbol}
                    </p>
                    <p className="text-[8px] text-[#adb7c5]">{item.name}</p>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-3 text-[8px] text-[#adb7c5]">
                    <div>
                      <p>数量</p>
                      <p className="text-[9px] font-semibold text-[#5f6c80]">
                        {item.qty}
                      </p>
                    </div>
                    <div>
                      <p>成本</p>
                      <p className="text-[9px] font-semibold text-[#5f6c80]">
                        {item.cost}
                      </p>
                    </div>
                    <div>
                      <p>现价</p>
                      <p className="text-[9px] font-semibold text-[#4772e8]">
                        {item.price}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-[8px] font-semibold ${
                      item.positive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {item.pnl}
                  </p>
                  <p
                    className={`mt-1 text-[8px] ${
                      item.positive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {item.change}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/positions" className="block">
          <SurfaceCard className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#5f6c80]">交易状况</p>
              <p className="text-[8px] text-[#aab3c0]">查看持仓变化</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#75a0ff]" />
          </SurfaceCard>
        </Link>
        <Link href="/records" className="block">
          <SurfaceCard className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#5f6c80]">交易纪录</p>
              <p className="text-[8px] text-[#aab3c0]">查看买卖明细</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#75a0ff]" />
          </SurfaceCard>
        </Link>
      </div>
    </AppScreen>
  );
}
