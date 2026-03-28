import Link from "next/link";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { holdings } from "../../lib/mock-data";

export default function PositionsPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="交易状况" showBack backHref="/profile" />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: "全部", active: true },
            { label: "盈利中" },
            { label: "已成交" },
          ]}
        />

        <div className="mt-2 space-y-1.5">
          {holdings.map((item) => (
            <Link
              key={item.symbol}
              href={`/trade/${item.symbol}`}
              className="block rounded-[4px] border border-[#edf1f8] bg-[#fbfdff] px-2 py-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#4f5d73]">
                      {item.symbol}
                    </span>
                    <span className="text-[8px] text-[#adb7c5]">{item.name}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-3 text-[8px] text-[#adb7c5]">
                    <div>
                      <p>现价</p>
                      <p className="text-[9px] font-semibold text-[#5f6c80]">
                        {item.price}
                      </p>
                    </div>
                    <div>
                      <p>数量</p>
                      <p className="text-[9px] font-semibold text-[#5f6c80]">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p>成交</p>
                      <p className="text-[9px] font-semibold text-[#5f6c80]">
                        {item.dealt}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[8px]">
                  <p className="rounded-full bg-[#edf4ff] px-1.5 py-0.5 text-[#4976e8]">
                    {item.side}
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-[#5f6c80]">
                    {item.quantity}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}
