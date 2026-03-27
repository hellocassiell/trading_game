import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  Ellipsis,
  Share2,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  homeStats,
  portfolioSummary,
  profile,
  rankingList,
  strongestUsers,
  summaryStats,
  topVolume,
} from "../lib/mock-data";
import SubTabs from "../components/SubTabs";

function BlockHeader({
  title,
  action,
  href,
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <p className="text-[11px] font-semibold text-[#5f6c80]">{title}</p>
      {action && href ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-[9px] font-medium text-[#79a2ff]"
        >
          {action}
          <ChevronRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-full bg-[#f3f6fb] pb-2 text-[#4b5563]">
      <header className="border-b border-[#d9e3f3] bg-white">
        <div className="flex h-9 items-center justify-between bg-[#4e79e8] px-2.5 text-white">
          <div className="text-[9px] font-semibold tracking-[0.04em]">
            AASTOCKS
            <span className="ml-1 text-blue-100">+</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <Share2 className="h-3.5 w-3.5" />
            <Bell className="h-3.5 w-3.5" />
            <Ellipsis className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="border-b border-[#e9eff9] px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="rounded-[2px] bg-[#ffefe0] px-1 py-[1px] text-[9px] font-semibold text-[#f59e0b]">
                美
              </span>
              <span className="truncate text-[10px] font-semibold text-[#5e6d85]">
                智财模拟美股投资大赛2020
              </span>
            </div>
            <span className="text-[9px] text-[#8f98a8]">比赛介绍</span>
          </div>

          <div className="mt-1.5 flex items-center gap-4">
            <button
              type="button"
              className="relative text-[10px] font-semibold text-[#4976e8]"
            >
              赛事统计
              <span className="absolute inset-x-0 -bottom-1.5 h-[2px] rounded-full bg-[#4976e8]" />
            </button>
            <button type="button" className="text-[10px] text-[#9aa3b2]">
              资产概况
            </button>
          </div>
        </div>

        <div className="px-2 py-2">
          <div className="rounded-[4px] border-2 border-[#4f79e8] bg-white px-2 py-2 shadow-[0_1px_8px_rgba(79,121,232,0.14)]">
            <div className="grid grid-cols-3 gap-2">
              {homeStats.map((item, index) => (
                <div
                  key={item.label}
                  className={`text-center ${index < 2 ? "border-r border-[#ecf2fa]" : ""}`}
                >
                  <p className="text-[9px] text-[#98a3b5]">{item.label}</p>
                  <p className="mt-1 text-[14px] font-bold leading-none text-[#ff8c1a]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[8px] text-[#b3bcc9]">{item.unit}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 rounded-[4px] bg-[#fbfcff] px-2 py-1.5">
              {summaryStats.map((item) => (
                <div key={item.label}>
                  <p className="text-[8px] text-[#9ba6b6]">{item.label}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-[#5f6c80]">
                    {item.value}
                  </p>
                  <p className="text-[8px] text-[#adb7c5]">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-1 px-0.5">
        <Link
          href="/ranking"
          className="block border border-[#dde6f4] bg-white px-2 py-2"
        >
          <div className="relative flex items-center gap-2">
            <div className="absolute right-0 top-0 h-9 w-9 rounded-full bg-[#edf4ff]" />
            <div className="absolute right-5 top-3 h-3 w-3 rounded-full bg-[#d7e6ff]" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#ffd86f] to-[#ffb524] shadow-[0_8px_16px_rgba(255,181,36,0.3)]">
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="relative min-w-0">
              <div className="flex items-end gap-1">
                <span className="text-[18px] font-extrabold leading-none text-[#ff9f0f]">
                  $50,000
                </span>
                <span className="text-[9px] font-semibold text-[#8d96a6]">
                  现金彩金奖赏
                </span>
              </div>
              <p className="mt-1 text-[8px] text-[#b1b8c5]">立即参加比赛赢取大奖</p>
            </div>
          </div>
        </Link>

        <Link href="/profile" className="block border border-[#dde6f4] bg-white px-2 py-2">
          <div className="flex items-start gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef1f6] text-[#a6afbc]">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-[11px] font-semibold text-[#4f5d73]">
                      {profile.name}
                    </p>
                    <Trophy className="h-3 w-3 text-[#f6b53b]" />
                  </div>
                  <p className="mt-0.5 truncate text-[8px] text-[#b0b8c5]">
                    {profile.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-[#b0b8c5]">排名</p>
                  <p className="text-[10px] font-semibold text-[#707c8f]">
                    {profile.ranking}
                  </p>
                </div>
              </div>

              <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
                {portfolioSummary.map((item) => (
                  <div key={item.label}>
                    <p className="text-[8px] text-[#adb7c5]">{item.label}</p>
                    <p className="truncate text-[9px] font-semibold text-[#657285]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-1.5 flex items-end justify-between rounded-[4px] bg-[#fbfdff] px-2 py-1.5">
                <div>
                  <p className="text-[8px] text-[#adb7c5]">总资产金额</p>
                  <p className="text-[11px] font-bold text-[#4772e8]">
                    {profile.totalAssetsUsd} 美元
                  </p>
                  <p className="text-[11px] font-bold text-[#4772e8]">
                    {profile.portfolioUsd} 港元
                  </p>
                </div>
                <div className="relative h-10 w-24">
                  <div className="absolute bottom-1 left-1 h-[2px] w-[72px] rotate-[10deg] bg-[#96b8ff]" />
                  <div className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                  <div className="absolute bottom-3 left-8 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                  <div className="absolute bottom-5 left-[52px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                  <div className="absolute bottom-7 left-[74px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        <section className="border border-[#dde6f4] bg-white px-2 py-2">
          <BlockHeader title="超级参赛者" action="排行榜" href="/ranking" />
          <SubTabs
            tabs={[
              { label: "今日", active: true },
              { label: "本周" },
              { label: "本月" },
            ]}
          />

          <div className="mt-1.5 rounded-[4px] border border-[#edf1f8] px-2 py-1.5">
            <div className="grid grid-cols-[1fr_auto] items-start gap-2 border-b border-dashed border-[#edf1f8] pb-1.5">
              <div className="min-w-0 text-[8px] leading-tight text-[#8f99a8]">
                Placeholder Placeholder Placeholder Placeholder Placeholder
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-[#657285]">1,053,705.00</p>
                <p className="text-[9px] font-semibold text-[#5f6c80]">FB</p>
              </div>
            </div>

            <div className="mt-1.5 grid grid-cols-5 gap-1.5">
              {strongestUsers.map((item, index) => (
                <div
                  key={item.symbol}
                  className={`flex aspect-square flex-col items-center justify-center rounded-full text-center ${
                    index === 2
                      ? "bg-gradient-to-br from-[#8fb0ff] to-[#5b88ff] text-white"
                      : "bg-gradient-to-br from-[#edf3ff] to-[#d8e6ff] text-[#4976e8]"
                  }`}
                >
                  <span className="text-[9px] font-bold leading-none">{item.symbol}</span>
                  <span className="mt-1 text-[8px]">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-[#dde6f4] bg-white px-2 py-2">
          <BlockHeader
            title="今日10大成交美股"
            action="进入选股"
            href="/market/top-volume"
          />
          <div className="space-y-1">
            {topVolume.slice(0, 2).map((item) => (
              <Link
                key={item.symbol}
                href={`/trade/${item.symbol}`}
                className="flex items-center justify-between border-b border-dashed border-[#edf1f8] pb-1 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-[9px] font-semibold text-[#ef4444]">{item.symbol}</p>
                  <p className="text-[8px] text-[#adb7c5]">{item.name}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#5f6c80]">
                  <span>{item.price}</span>
                  <span className={item.delta === "▼" ? "text-[#ef4444]" : "text-[#22c55e]"}>
                    {item.delta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border border-[#dde6f4] bg-white px-2 py-2">
          <BlockHeader title="每周冠军星" />
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff5ff] text-[#4f79e8]">
              <Star className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-[#4f5d73]">Kit Chu</p>
                  <p className="text-[8px] text-[#b0b8c5]">Placeholder Placeholder Placeholder</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-[#b0b8c5]">本周升幅</p>
                  <p className="text-[10px] font-bold text-[#22c55e]">+9%</p>
                  <p className="text-[9px] font-semibold text-[#22c55e]">+1083</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-[#dde6f4] bg-white px-2 py-2">
          <BlockHeader title="排行榜" action="更多" href="/ranking" />
          <div className="space-y-0.5">
            {rankingList.map((item, index) => (
              <Link
                key={`${item.rank}-${item.name}`}
                href={item.current ? "/profile" : "/ranking"}
                className={`flex items-center justify-between rounded-[4px] px-1.5 py-1 ${
                  item.current ? "bg-[#eef5ff]" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-bold ${
                      index < 3
                        ? "bg-[#fff1cf] text-[#f59e0b]"
                        : "bg-[#f1f5f9] text-[#7c8798]"
                    }`}
                  >
                    {item.rank}
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      item.current
                        ? "bg-gradient-to-br from-[#6b93ff] to-[#2b5ce5] text-white"
                        : "bg-[#eef1f6] text-[#a3acb9]"
                    }`}
                  >
                    <UserRound className="h-3 w-3" />
                  </div>
                  <p className="truncate text-[10px] font-medium text-[#5f6c80]">
                    {item.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#5f6c80]">
                    {item.amount}
                  </p>
                  <p className="text-[8px] text-[#22c55e]">{item.gain}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
