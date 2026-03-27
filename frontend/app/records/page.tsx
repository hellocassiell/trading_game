import Link from "next/link";

import AppScreen from "../../components/AppScreen";
import ScreenTopBar from "../../components/ScreenTopBar";
import SubTabs from "../../components/SubTabs";
import SurfaceCard from "../../components/SurfaceCard";
import { records } from "../../lib/mock-data";

export default function RecordsPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="交易纪录" showBack backHref="/profile" />

      <SurfaceCard>
        <SubTabs
          tabs={[
            { label: "全部", active: true },
            { label: "买入纪录" },
            { label: "卖出纪录" },
          ]}
        />

        <div className="mt-2 space-y-1.5">
          {records.map((item) => (
            <Link
              key={`${item.symbol}-${item.side}-${item.qty}`}
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
                  <p className="mt-1 text-[8px] text-[#adb7c5]">{item.date}</p>
                </div>
                <div className="text-right text-[8px]">
                  <p
                    className={`rounded-full px-1.5 py-0.5 ${
                      item.side === "买入"
                        ? "bg-[#edf4ff] text-[#4976e8]"
                        : "bg-[#fff1f1] text-[#ef4444]"
                    }`}
                  >
                    {item.side}
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-[#5f6c80]">
                    {item.price} / {item.qty}
                  </p>
                  <p className="text-[8px] text-[#adb7c5]">{item.amount}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}
