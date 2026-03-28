import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronRight,
  Coins,
  Medal,
  Repeat2,
  Share2,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { TradeTrigger } from "../components/TradeModal";
import { getHomePageData } from "../lib/adapters/home";

function SectionTitle({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[21px] font-black leading-none text-[#24180f]">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[var(--app-orange-dark)]"
        >
          更多
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function EventStatIcon({ icon }: { icon: string }) {
  if (icon === "users") {
    return <Users className="h-4 w-4" />;
  }
  if (icon === "value") {
    return <Wallet className="h-4 w-4" />;
  }
  if (icon === "coin") {
    return <Coins className="h-4 w-4" />;
  }

  return <Repeat2 className="h-4 w-4" />;
}

function RankingMedal({ rank }: { rank: string }) {
  if (rank === "1") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffd665_0%,#f7a300_100%)] text-[14px] font-black text-white shadow-[0_8px_16px_rgba(230,118,0,0.18)]">
        1
      </span>
    );
  }

  if (rank === "2") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d7d9de_0%,#a6acb6_100%)] text-[14px] font-black text-white">
        2
      </span>
    );
  }

  if (rank === "3") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f0b77c_0%,#d57e2f_100%)] text-[14px] font-black text-white">
        3
      </span>
    );
  }

  return (
    <span className="w-8 text-center text-[17px] font-black leading-none text-[#342316]">
      {rank}
    </span>
  );
}

function RankingMovement({ movement }: { movement: string }) {
  if (movement === "up") {
    return <ArrowUp className="h-4 w-4 text-[#2eb568]" strokeWidth={3} />;
  }

  if (movement === "down") {
    return <ArrowDown className="h-4 w-4 text-[#ef655d]" strokeWidth={3} />;
  }

  return <span className="text-[16px] font-bold text-[#c6b7a8]">-</span>;
}

export default function HomePage() {
  const {
    status,
    appMeta,
    eventStats: homeEventStats,
    summaryCard: homeSummaryCard,
    starParticipants: homeStarParticipants,
    holdingCloud: homeHoldingCloud,
    volumeSnapshot: homeVolumeSnapshot,
    weeklyFlyers: homeWeeklyFlyers,
    rankingRows: homeRankingRows,
  } = getHomePageData();

  if (status === "error") {
    return (
      <div className="px-[var(--app-gutter)] py-10">
        <div className="app-panel rounded-[28px] px-5 py-8 text-center">
          <p className="text-[18px] font-black text-[#2a1b12]">主页加载失败</p>
          <p className="mt-2 text-[13px] text-[#9d8162]">请稍后再试，或返回上一页重试。</p>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="px-[var(--app-gutter)] py-10">
        <div className="app-panel rounded-[28px] px-5 py-8 text-center">
          <p className="text-[18px] font-black text-[#2a1b12]">暂无赛事资料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent text-[#533b23]">
      <header className="overflow-hidden bg-[linear-gradient(180deg,#ffbb69_0%,#ff9825_53%,#dc7300_100%)] px-[var(--app-gutter)] pb-5 pt-[max(env(safe-area-inset-top),12px)] text-white shadow-[0_18px_32px_rgba(171,86,0,0.2)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1 text-[15px] font-black tracking-[0.03em]">
            <span>{appMeta.brand}</span>
            <ChevronRight className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label="分享"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/14 active:bg-white/20"
              aria-label="通知"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffe06d]" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-white px-3 py-2 text-[#6b4a21] shadow-[0_10px_22px_rgba(98,56,10,0.12)]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0d8] text-[var(--app-orange-dark)]">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-black">智财港股投资大赛2020</span>
          </div>
          <span className="text-[13px] font-bold text-[#7b5c38]">由 Citi 赞助</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/78">
              HONG KONG STOCK TRADING GAME
            </p>
            <h1 className="mt-1 text-[26px] font-black leading-none">赛事统计</h1>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[12px] font-bold">
            <span className="text-[15px]">🇭🇰</span>
            <span>货币 港元</span>
          </div>
        </div>

        <div className="mt-3 rounded-[28px] bg-white px-4 py-4 text-[#412c1a] shadow-[0_16px_28px_rgba(95,53,7,0.14)]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {homeEventStats.map((item) => (
              <div key={item.label} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff5e8_0%,#ffe1ba_100%)] text-[var(--app-orange-dark)]">
                  <EventStatIcon icon={item.icon} />
                </div>
                <p className="mt-2 text-[12px] font-bold leading-tight text-[#6d5a45]">
                  {item.label}
                </p>
                <p className="mt-1 text-[17px] font-black leading-tight text-[#22160d]">
                  {item.primary}
                </p>
                {item.secondary ? (
                  <p className="mt-0.5 text-[13px] font-bold leading-tight text-[#46301d]">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#b19573]">
            最後更新 2021/04/21 22:00 HKT
          </p>
        </div>
      </header>

      <main className="space-y-4 px-[var(--app-gutter)] pb-5 pt-3">
        <Link
          href="/guest"
          className="relative block overflow-hidden rounded-[24px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]"
        >
          <div className="absolute inset-y-0 right-0 w-[45%] bg-[radial-gradient(circle_at_top,rgba(255,198,132,0.38),transparent_55%)]" />
          <div className="relative flex items-center gap-3">
            <div className="relative h-14 w-16 shrink-0">
              <div className="absolute left-0 top-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff0d8] text-[var(--app-orange-dark)] shadow-[0_8px_16px_rgba(255,177,81,0.18)]">
                <Coins className="h-5 w-5" />
              </div>
              <div className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffd37e_0%,#ff9a1f_100%)] text-white shadow-[0_8px_16px_rgba(243,139,27,0.22)]">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[15px] font-black leading-tight text-[#392416]">想赚取</p>
              <p className="mt-1 text-[22px] font-black leading-tight text-[var(--app-orange-dark)]">
                $500,000港元模拟交易资金？
              </p>
              <p className="mt-1.5 text-[13px] font-bold text-[#f18917]">查看详情</p>
            </div>
          </div>
        </Link>

        <section className="overflow-hidden rounded-[24px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#f0ece7]" />
              <div className="min-w-0">
                <p className="truncate text-[22px] font-black leading-none text-[#26180f]">
                  {homeSummaryCard.name}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-[#fff4e5] px-3 py-1.5 text-[13px] font-black text-[#6b4a21]">
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-4 w-4 text-[var(--app-orange-dark)]" />
                排名 {homeSummaryCard.rank}
                <span className="text-[#2eb568]">↑ {homeSummaryCard.rankRise}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[14px] font-bold text-[#4d3826]">
            <div>
              <p>{homeSummaryCard.dailyTrades}</p>
              <p className="mt-1">{homeSummaryCard.requiredTrades}</p>
            </div>
            <div className="text-right">
              <p>
                尚余 <span className="text-[20px] font-black">{homeSummaryCard.dailyTradesValue}</span>
              </p>
              <p className="mt-1">
                尚欠 <span className="text-[20px] font-black text-[#ef655d]">{homeSummaryCard.requiredTradesValue}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 rounded-[20px] bg-[#fffaf4] px-3.5 py-3">
            <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#7a624a]">
              <span>证券参考市值</span>
              <span className="text-[18px] font-black text-[#291b12]">
                {homeSummaryCard.referenceValue} 港元
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#7a624a]">
              <span>可投资馀额</span>
              <span className="text-[18px] font-black text-[#291b12]">{homeSummaryCard.cash} 港元</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[15px] font-bold text-[#5f472d]">
              <span>资产总值</span>
              <span className="text-[22px] font-black text-[var(--app-orange-dark)]">
                {homeSummaryCard.totalAssets} 港元
              </span>
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium text-[#b19573]">
            资料更新 {homeSummaryCard.updatedAt}
          </p>
        </section>

        <section className="space-y-3">
          <SectionTitle title="星级参赛者" href="/ranking" />

          <div className="flex gap-2">
            {homeStarParticipants.tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 text-[17px] font-black leading-none ${
                  index === 0
                    ? "bg-[#ffe8c5] text-[#bf7210]"
                    : "bg-[#fff5e7] text-[#c59d6c]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            href="/ranking"
            className="relative block overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]"
          >
            <div className="pointer-events-none absolute -left-6 top-6 h-16 w-16 rounded-full bg-[#f4efe8]" />
            <div className="pointer-events-none absolute -right-8 top-8 h-16 w-16 rounded-full bg-[#faf2e4]" />

            <div className="relative flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 rounded-full bg-[#f0ece7]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[22px] font-black leading-none text-[#26180f]">
                      {homeStarParticipants.featured.name}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff2dc] px-3 py-1 text-[13px] font-black text-[#6e4b21]">
                      <Medal className="h-4 w-4 text-[var(--app-orange-dark)]" />
                      {homeStarParticipants.featured.tag}
                    </span>
                </div>

                <p className="mt-3 text-[17px] font-medium leading-[1.3] text-[#4a3828]">
                  {homeStarParticipants.featured.intro}
                </p>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[15px]">
                  <span className="font-bold text-[#9f8d78]">资产总值</span>
                  <span className="text-right text-[20px] font-black text-[var(--app-orange-dark)]">
                    {homeStarParticipants.featured.totalAssets}
                  </span>
                  <span className="font-bold text-[#9f8d78]">重仓港股</span>
                  <span className="text-right text-[19px] font-black text-[#2b1d13]">
                    {homeStarParticipants.featured.holding}
                  </span>
                  <span className="font-bold text-[#9f8d78]">最近交易</span>
                  <span className="text-right text-[19px] font-black text-[#2b1d13]">
                    {homeStarParticipants.featured.recentTrade}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        <section className="space-y-3">
          <SectionTitle title="参赛者20大持仓" href="/market/top-holdings" />

          <div className="relative h-[234px] overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="pointer-events-none absolute left-3 top-6 h-7 w-7 rounded-full bg-[#ffe6bd]" />
            <div className="pointer-events-none absolute left-10 bottom-7 h-9 w-9 rounded-full bg-[#fff0d5]" />
            <div className="pointer-events-none absolute right-6 top-7 h-8 w-8 rounded-full bg-[#ffe5c1]" />
            <div className="pointer-events-none absolute right-3 bottom-8 h-10 w-10 rounded-full bg-[#fff0d8]" />

            {homeHoldingCloud.map((item) => (
              <div
                key={`${item.rank}-${item.symbol}`}
                className="absolute"
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                }}
              >
                <TradeTrigger
                  symbol={item.symbol}
                  className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffbf73_0%,#ff9220_62%,#de7600_100%)] text-center text-white shadow-[0_18px_24px_rgba(230,118,0,0.18)]"
                >
                  <span className="text-[11px] font-black leading-none opacity-90">{item.rank}</span>
                  <span className="mt-1 text-[22px] font-black leading-none">{item.symbol}</span>
                  <span className="mt-1 text-[22px] font-black leading-none">{item.value}</span>
                  <span className="mt-1 text-[12px] font-bold leading-none opacity-95">{item.unit}</span>
                </TradeTrigger>
              </div>
            ))}

            <p className="absolute bottom-4 left-4 text-[11px] font-medium text-[#b19573]">
              最後更新 2021/04/21 22:00 HKT
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title="今日10大成交股票" href="/market/top-volume" />

          <div className="overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <TradeTrigger
              symbol={homeVolumeSnapshot.buy.symbol}
              className="grid w-full grid-cols-[1fr_auto] gap-4 border-b border-[#f2e7da] pb-4 text-left"
            >
              <div className="flex gap-3">
                <span className="mt-1 h-10 w-1.5 rounded-full bg-[#ffb24d]" />
                <div>
                  <p className="text-[14px] font-bold text-[#f18917]">
                    {homeVolumeSnapshot.buy.label}
                  </p>
                  <p className="mt-1 text-[26px] font-black leading-none text-[#271910]">
                    {homeVolumeSnapshot.buy.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#d2a06d]">
                  {homeVolumeSnapshot.buy.amountLabel}
                </p>
                <p className="mt-1 text-[23px] font-black leading-none text-[#271910]">
                  {homeVolumeSnapshot.buy.amount}
                </p>
              </div>
            </TradeTrigger>

            <TradeTrigger
              symbol={homeVolumeSnapshot.sell.symbol}
              className="grid w-full grid-cols-[1fr_auto] gap-4 pt-4 text-left"
            >
              <div className="flex gap-3">
                <span className="mt-1 h-10 w-1.5 rounded-full bg-[var(--app-orange-dark)]" />
                <div>
                  <p className="text-[14px] font-bold text-[var(--app-orange-dark)]">
                    {homeVolumeSnapshot.sell.label}
                  </p>
                  <p className="mt-1 text-[26px] font-black leading-none text-[#271910]">
                    {homeVolumeSnapshot.sell.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#d2a06d]">
                  {homeVolumeSnapshot.sell.amountLabel}
                </p>
                <p className="mt-1 text-[23px] font-black leading-none text-[#271910]">
                  {homeVolumeSnapshot.sell.amount}
                </p>
              </div>
            </TradeTrigger>

            <p className="mt-4 text-[11px] font-medium text-[#b19573]">
              最後更新 2021/04/21 22:00 HKT
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title="每周飞跃王" />

          <div className="flex gap-2">
            {homeWeeklyFlyers.tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 text-[17px] font-black leading-none ${
                  index === 0
                    ? "bg-[#ffe8c5] text-[#bf7210]"
                    : "bg-[#fff5e7] text-[#c59d6c]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="pointer-events-none absolute inset-y-6 right-8 w-[120px] rotate-12 rounded-[22px] border border-[#f4eadb] bg-[#fffaf3]/80" />

            <div className="relative">
              <p className="text-[24px] font-black leading-none text-[#26180f]">
                {homeWeeklyFlyers.featured.name}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[14px] font-bold text-[#8a7053]">
                <Trophy className="h-4 w-4 text-[var(--app-orange-dark)]" />
                {homeWeeklyFlyers.featured.tag}
              </p>

              <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
                <span className="text-[15px] font-bold text-[#9f8d78]">
                  {homeWeeklyFlyers.featured.period}
                </span>
                <span className="text-[15px] font-bold text-[#9f8d78]">
                  {homeWeeklyFlyers.featured.gainLabel}
                </span>
                <span className="text-[20px] font-black text-[#2c1e14]">整体变动</span>
                <span className="text-right text-[28px] font-black leading-none text-[#2eb568]">
                  {homeWeeklyFlyers.featured.gain}
                </span>
                <span className="text-[20px] font-black text-[#2c1e14]">
                  {homeWeeklyFlyers.featured.riseLabel}
                </span>
                <span className="text-right text-[28px] font-black leading-none text-[#2eb568]">
                  ↑ {homeWeeklyFlyers.featured.rise}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle title="排行榜" href="/ranking" />

          <div className="overflow-hidden rounded-[26px] border border-[#f4ddc2] bg-white shadow-[0_12px_28px_rgba(171,86,0,0.08)]">
            <div className="grid grid-cols-[92px_1fr_auto] items-end gap-2 border-b border-[#f0e5d8] px-4 pb-3 pt-4">
              <div>
                <p className="text-[14px] font-bold text-[#aa9781]">排名/变动</p>
                <p className="mt-1 text-[15px] font-bold text-[#aa9781]">参赛者</p>
              </div>
              <div />
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-[13px] font-bold text-[#aa9781]">
                  <span>🇭🇰</span>
                  货币 港元
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#aa9781]">总资产/整体变动</p>
              </div>
            </div>

            <div className="px-4">
              {homeRankingRows.map((item, index) => (
                <div
                  key={`${item.rank}-${item.name}`}
                  className={`grid grid-cols-[92px_1fr_auto] items-center gap-2 py-3 ${
                    index !== 0 ? "border-t border-[#f5ede2]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RankingMedal rank={item.rank} />
                    <RankingMovement movement={item.movement} />
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#f0ece7]" />
                    <p className="truncate text-[20px] font-black leading-none text-[#2a1b12]">
                      {item.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[19px] font-black leading-none text-[#2a1b12]">
                      {item.amount}
                    </p>
                    <p className="mt-1 text-[16px] font-black leading-none text-[#2eb568]">
                      {item.gain}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-3 pt-2 text-[11px] font-medium text-[#b19573]">
              截至 2021/04/21 22:00 HKT
            </div>

            <div className="pb-4">
              <div className="mx-auto flex h-6 w-14 items-center justify-center rounded-full bg-[#fff3e4] text-[#d07e0f]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="mx-1 h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
