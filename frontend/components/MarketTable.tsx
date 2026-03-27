import Link from "next/link";

import SurfaceCard from "./SurfaceCard";

type MarketRow = {
  symbol: string;
  name: string;
  value: string;
  delta?: string;
};

type MarketTableProps = {
  headerLeft: string;
  headerRight: string;
  rows: MarketRow[];
  negative?: boolean;
};

export default function MarketTable({
  headerLeft,
  headerRight,
  rows,
  negative = false,
}: MarketTableProps) {
  return (
    <SurfaceCard className="px-2 py-2">
      <div className="grid grid-cols-[1fr_auto] items-center border-b border-[#edf1f8] px-1 pb-1 text-[8px] text-[#9aa4b3]">
        <span>{headerLeft}</span>
        <span>{headerRight}</span>
      </div>

      <div className="mt-1">
        {rows.map((item) => (
          <Link
            key={`${item.symbol}-${item.name}`}
            href={`/trade/${item.symbol}`}
            className="grid grid-cols-[1fr_auto] items-center border-b border-dashed border-[#edf1f8] px-1 py-1.5 last:border-b-0"
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-[#4f5d73]">
                {item.symbol}
              </span>
              <span className="text-[8px] text-[#adb7c5]">{item.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#5f6c80]">
              <span>{item.value}</span>
              {item.delta ? (
                <span className={negative || item.delta === "▼" ? "text-[#ef4444]" : "text-[#22c55e]"}>
                  {item.delta}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </SurfaceCard>
  );
}
