import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import { TradeTrigger } from "../../components/TradeModal";
import { getRankingPageData } from "../../lib/adapters/ranking";

function TrendChart({
  chartLabels,
  chartValues,
}: {
  chartLabels: readonly string[];
  chartValues: readonly number[];
}) {

  const points = chartValues
    .map((value, index) => {
      const x = 20 + index * 66;
      const y = 144 - value;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
      <div className="mt-4">
        <svg
          viewBox="0 0 304 158"
          className="h-[126px] w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 132H294" stroke="#efe3d4" strokeWidth="1.5" />
        <path d="M10 94H294" stroke="#f4eadf" strokeWidth="1" />
        <path d="M10 56H294" stroke="#f6ede4" strokeWidth="1" />
        <path d={points} stroke="#f6c47b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {chartValues.map((value, index) => {
          const x = 20 + index * 66;
          const y = 144 - value;

          return (
            <g key={`${chartLabels[index]}-${value}`}>
              <circle cx={x} cy={y} r="8" fill="white" />
              <circle cx={x} cy={y} r="5" fill="#ff8c1a" />
            </g>
          );
        })}
      </svg>

      <div className="mt-1 grid grid-cols-5 text-center text-[12px] font-medium text-[#99806a]">
        {chartLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export default function RankingPage() {
  const { status, starParticipants } = getRankingPageData();
  const {
    featured,
    tabs,
    holdings,
    holdingsTitle,
    currencyLabel,
    disclaimer,
    footerUpdatedAt,
  } = starParticipants;

  if (status === "error") {
    return (
      <AppScreen>
        <div className="app-panel rounded-[28px] px-5 py-10 text-center">
          <p className="text-[18px] font-black text-[#2a1b12]">星级参赛者资料加载失败</p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+86px)]">
      <div className="min-h-full overflow-hidden bg-[linear-gradient(180deg,#ffb761_0%,#ff9421_44%,#df7700_100%)]">
        <div className="px-4 pb-5 pt-[max(env(safe-area-inset-top),14px)] text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
                aria-label="返回"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="truncate text-[18px] font-black leading-none">星级参赛者</h1>
            </div>

            <div className="flex shrink-0 gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full px-3.5 py-1.5 text-[14px] font-black leading-none ${
                    index === 0
                      ? "bg-[#ffd68d] text-[#9d5b00]"
                      : "bg-[#f2a63a]/45 text-[#ffe7bf]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[24px] border border-[#f6e1c6] bg-white px-4 py-4 text-[#2f2117] shadow-[0_18px_34px_rgba(120,62,0,0.18)]">
            <div className="pointer-events-none absolute left-[-12px] top-[88px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#f8f2ea]">
              A
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ece7] text-[#c9b9a4]">
                  <UserRound className="h-8 w-8" />
                </div>
                <p className="truncate text-[24px] font-black leading-none text-[#24170f]">
                  {featured.name}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#fff3de] px-3 py-1.5 text-[13px] font-black text-[#85531a]">
                {featured.tag}
              </span>
            </div>

            <div className="relative mt-4">
              <p className="text-[14px] font-bold text-[#b09a83]">今日投资建议</p>
              <p className="mt-1 text-[16px] font-semibold leading-[1.4] text-[#4d3a29]">
                {featured.intro}
              </p>
            </div>

            <div className="relative mt-5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 rounded-[18px] bg-[#fff9f2] px-3 py-3">
              <span className="text-[15px] font-bold text-[#8d7964]">证券参考市值</span>
              <span className="text-[16px] font-black text-[#22160d]">
                {featured.marketValue} 港币
              </span>
              <span className="text-[15px] font-bold text-[#8d7964]">可投资馀额</span>
              <span className="text-[16px] font-black text-[#22160d]">{featured.cash} 港币</span>
              <span className="text-[15px] font-black text-[var(--app-orange-dark)]">资产总值</span>
              <span className="text-[16px] font-black text-[var(--app-orange-dark)]">
                {featured.totalAssets} 港币
              </span>
            </div>

            <TrendChart
              chartLabels={featured.chartLabels}
              chartValues={featured.chartValues}
            />

            <p className="relative mt-3 text-[11px] font-medium text-[#b39a80]">
              资料更新 {featured.updatedAt}
            </p>
          </div>
        </div>

        <div className="rounded-t-[28px] bg-white px-4 pb-6 pt-0">
          <div className="-mx-4 flex items-center justify-between bg-[linear-gradient(180deg,#ffaf4d_0%,#ff8916_100%)] px-4 py-3 text-white shadow-[0_8px_20px_rgba(171,86,0,0.12)]">
            <h2 className="text-[19px] font-black leading-none">{holdingsTitle}</h2>
            <span className="rounded-full bg-white/16 px-3 py-1 text-[12px] font-bold">
              {currencyLabel}
            </span>
          </div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-[10px] top-[8px] text-[220px] font-black leading-none tracking-[-0.08em] text-[#faf4ec]">
              A
            </div>

            <div className="relative divide-y divide-[#f2e7da]">
              {holdings.map((item) => (
                <TradeTrigger
                  key={item.symbol}
                  symbol={item.symbol}
                  className="grid w-full grid-cols-[1fr_auto] gap-4 py-4 text-left active:bg-[#fffaf3]"
                >
                  <div>
                    <p className="text-[24px] font-black leading-none text-[#23170e]">{item.symbol}</p>

                    <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
                      <span className="font-bold text-[#9f8a74]">持股量</span>
                      <span className="font-black text-[#2b1d13]">{item.quantity}</span>
                      <span className="font-bold text-[#9f8a74]">持股 (可交易)</span>
                      <span className="font-black text-[#2b1d13]">{item.available}</span>
                      <span className="font-bold text-[#9f8a74]">赚蚀*</span>
                      <span
                        className={`font-black ${
                          item.positive ? "text-[#2eb568]" : "text-[#ef655d]"
                        }`}
                      >
                        {item.profit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p
                        className={`text-[17px] font-black leading-none ${
                          item.positive ? "text-[#2eb568]" : "text-[#ef655d]"
                        }`}
                      >
                        {item.positive ? "▲" : "▼"} {item.currentPrice}
                      </p>
                      <p
                        className={`mt-1 text-[15px] font-black leading-tight ${
                          item.positive ? "text-[#2eb568]" : "text-[#ef655d]"
                        }`}
                      >
                        {item.change}
                      </p>
                    </div>

                    <div className="mt-4 text-right">
                      <p className="text-[14px] font-bold text-[#9f8a74]">参考市值</p>
                      <p className="mt-1 text-[16px] font-black leading-none text-[#2b1d13]">
                        {item.referenceValue}
                      </p>
                    </div>
                  </div>
                </TradeTrigger>
              ))}
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium text-[#b39a80]">更新於 {footerUpdatedAt}</p>
          <p className="mt-2 text-[11px] leading-[1.5] text-[#9f8a74]">{disclaimer}</p>
        </div>
      </div>
    </AppScreen>
  );
}
