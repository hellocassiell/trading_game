"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import { TradeTrigger } from "../../components/TradeModal";
import { holdings, records } from "../../lib/mock-data";

type RecordTab = "status" | "history";
type StatusFilter = "all" | "pending" | "done";
type HistoryItem = (typeof records)[number];

function formatStatusTone(status: string) {
  if (status.includes("成交")) {
    return "bg-[#fff2df] text-[var(--app-orange-dark)]";
  }
  if (status.includes("排队")) {
    return "bg-[#fff8ef] text-[#b48b5e]";
  }
  if (status.includes("取消")) {
    return "bg-[#f3f3f3] text-[#8f8f8f]";
  }

  return "bg-[#fff8ef] text-[#8f8f8f]";
}

function sideTone(side: string) {
  return side === "买入" ? "text-[#7aa4ff]" : "text-[#f19a68]";
}

function parseDateLabel(time: string) {
  return time.split(" ")[0];
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>("status");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredHoldings = holdings.filter((item) => {
    if (statusFilter === "pending") {
      return item.status.includes("排队");
    }
    if (statusFilter === "done") {
      return item.status.includes("成交");
    }

    return true;
  });

  const groupedRecords = useMemo(() => {
    return records.reduce<Record<string, HistoryItem[]>>((acc, item) => {
      const key = parseDateLabel(item.time);
      acc[key] ??= [];
      acc[key].push(item);
      return acc;
    }, {});
  }, []);

  const historyDates = Object.keys(groupedRecords).sort((a, b) => (a < b ? 1 : -1));

  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+82px)]">
      <div className="min-h-full bg-white">
        <div className="overflow-hidden bg-[linear-gradient(180deg,#ffb55c_0%,#ff9320_58%,#d96d00_100%)] pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_14px_28px_rgba(171,86,0,0.16)]">
          <div className="flex items-center justify-between px-4 pb-5">
            <div className="flex items-center gap-1 text-[15px] font-black tracking-[0.03em]">
              <span>AASTOCKS</span>
              <span className="text-[11px] opacity-85">↗</span>
            </div>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffe06a]" />
            </div>
          </div>

          <div className="grid grid-cols-2 text-center">
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`relative h-12 text-[16px] font-black ${
                activeTab === "status" ? "text-[#ffe26f]" : "text-[#ffd5a0]"
              }`}
            >
              交易状况
              {activeTab === "status" ? (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-full bg-[#ffe26f]" />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`relative h-12 text-[16px] font-black ${
                activeTab === "history" ? "text-[#ffe26f]" : "text-[#ffd5a0]"
              }`}
            >
              交易记录
              {activeTab === "history" ? (
                <span className="absolute bottom-0 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-full bg-[#ffe26f]" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="border-b border-[#efe5d8] px-4 py-2.5">
          <div className="flex items-center gap-1 text-[12px] font-black text-[#8f7a66]">
            <span>🇭🇰</span>
            <span>货币 (港币)</span>
          </div>
        </div>

        {activeTab === "status" ? (
          <>
            <div className="border-b border-[#efe5d8] px-4 py-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "all", label: "全部" },
                  { key: "pending", label: "排队中" },
                  { key: "done", label: "已成交" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key as StatusFilter)}
                    className={`h-9 rounded-full text-[14px] font-black ${
                      statusFilter === item.key
                        ? "bg-[#59606b] text-white"
                        : "bg-transparent text-[#7f7f7f]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[#efe7dc]">
              {filteredHoldings.map((item, index) => (
                <TradeTrigger
                  key={`${item.symbol}-${item.time}`}
                  symbol={item.symbol}
                  variant="order"
                  className="block w-full px-4 py-3 text-left active:bg-[#fffaf3]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[18px] font-black leading-none text-[#2f2c28]">{item.symbol}</p>
                      <div className="mt-2 grid grid-cols-[auto_auto] gap-x-5 gap-y-1 text-[12px] leading-5">
                        <span className="text-[#9e9081]">落盘价位</span>
                        <span className="font-black text-[#3f3932]">{item.price}</span>
                        <span className="text-[#9e9081]">落盘股数</span>
                        <span className="font-black text-[#3f3932]">{item.quantity}</span>
                        <span className="text-[#9e9081]">落单时间</span>
                        <span className="font-medium text-[#b0a294]">{item.time}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-[13px] font-black ${sideTone(item.side)}`}>{item.side}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${formatStatusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-[auto_auto] justify-end gap-x-3 gap-y-1 text-[12px] leading-5">
                        <span className="text-[#9e9081]">成交股数</span>
                        <span className="font-black text-[#3f3932]">{item.dealt}</span>
                        <span className="text-[#9e9081]">交易编号</span>
                        <span className="font-black text-[#3f3932]">{63 - index}</span>
                      </div>
                      <ChevronRight className="ml-auto mt-1 h-4 w-4 text-[#c4b6a7]" />
                    </div>
                  </div>
                </TradeTrigger>
              ))}
            </div>
          </>
        ) : (
          <div className="pb-10">
            {historyDates.map((date) => (
              <div key={date}>
                <div className="border-b border-[#efe7dc] px-4 py-2 text-[13px] font-black text-[#beb0a1]">
                  {date}
                </div>

                <div className="divide-y divide-[#efe7dc]">
                  {groupedRecords[date].map((item, index) => (
                    <div key={`${item.symbol}-${item.time}-${index}`} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[18px] font-black leading-none text-[#2f2c28]">{item.symbol}</p>
                          <div className="mt-2 grid grid-cols-[auto_auto] gap-x-5 gap-y-1 text-[12px] leading-5">
                            <span className="text-[#9e9081]">落盘价位</span>
                            <span className="font-black text-[#3f3932]">{item.price}</span>
                            <span className="text-[#9e9081]">落盘股数</span>
                            <span className="font-black text-[#3f3932]">{item.quantity}</span>
                            <span className="text-[#9e9081]">落单时间</span>
                            <span className="font-medium text-[#b0a294]">{item.time}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-[13px] font-black ${sideTone(item.side)}`}>{item.side}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${formatStatusTone(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-[auto_auto] justify-end gap-x-3 gap-y-1 text-[12px] leading-5">
                            <span className="text-[#9e9081]">成交股数</span>
                            <span className="font-black text-[#3f3932]">{item.dealt}</span>
                            <span className="text-[#9e9081]">交易编号</span>
                            <span className="font-black text-[#3f3932]">{52 + index + date.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppScreen>
  );
}
