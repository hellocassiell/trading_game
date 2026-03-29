"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";

import AppScreen from "../../components/AppScreen";
import { TradeTrigger } from "../../components/TradeModal";
import { tradingApiClient } from "../../lib/api";
import type { ActiveOrder, TradeHistoryItem } from "../../lib/api";
import {
  filterActiveOrders,
  groupTradeHistoryByDate,
  mapOrderToRecordCard,
  type StatusFilter,
} from "../../lib/adapters/records";

type RecordTab = "status" | "history";
type LoadState = "loading" | "success" | "empty" | "error";

function formatStatusTone(status: string) {
  if (status.includes("FILLED")) {
    return "bg-[#fff2df] text-[var(--app-orange-dark)]";
  }
  if (status.includes("PENDING") || status.includes("PARTIAL")) {
    return "bg-[#fff8ef] text-[#b48b5e]";
  }
  if (status.includes("CANCEL")) {
    return "bg-[#f3f3f3] text-[#8f8f8f]";
  }

  return "bg-[#fff8ef] text-[#8f8f8f]";
}

function sideTone(side: string) {
  return side === "BUY" ? "text-[var(--app-orange-dark)]" : "text-[var(--app-green)]";
}

function sideBadgeTone(side: string) {
  return side === "BUY"
    ? "bg-[#fff3df] text-[var(--app-orange-dark)]"
    : "bg-[#edf8f1] text-[var(--app-green)]";
}

function statusLabel(status: ActiveOrder["status"] | TradeHistoryItem["status"]) {
  if (status === "PENDING" || status === "PARTIAL_FILLED") {
    return "排队中";
  }
  if (status === "FILLED") {
    return "已成交";
  }
  if (status === "CANCELED") {
    return "已取消";
  }
  return "已拒绝";
}

function directionLabel(direction: ActiveOrder["direction"] | TradeHistoryItem["direction"]) {
  return direction === "BUY" ? "买入" : "卖出";
}

type RecordCardItem = ReturnType<typeof mapOrderToRecordCard>;

function OrderCard({
  item,
  showHint,
}: {
  item: RecordCardItem;
  showHint: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_120px] gap-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[16px] font-black leading-none text-[#2f2c28]">{item.symbol}</p>
          <p className="text-helper truncate text-[#887764]">{item.name || "--"}</p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <p className="text-label text-[#9e9081]">
            落盘价位 <span className="ml-1 font-black text-[#3f3932]">{item.price}</span>
          </p>
          <p className="text-label text-[#9e9081]">
            落盘股数 <span className="ml-1 font-black text-[#3f3932]">{item.quantity}</span>
          </p>
        </div>
        <p className="text-label mt-1 text-[#9e9081]">
          落单时间 <span className="ml-1 font-semibold text-[#6a5a49]">{item.time}</span>
        </p>
        <p className="text-label mt-1 truncate text-[#9e9081]">
          交易编号 <span className="ml-1 font-black text-[#3f3932]">{item.orderId}</span>
        </p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span
            className={`text-label rounded-full px-2.5 py-1 font-black ${sideBadgeTone(item.direction)}`}
          >
            {directionLabel(item.direction)}
          </span>
          <span
            className={`text-label rounded-full px-2.5 py-1 font-black ${formatStatusTone(item.status)}`}
          >
            {statusLabel(item.status)}
          </span>
        </div>
        <div className="mt-2 text-right">
          <p className="text-label text-[#9e9081]">成交股数</p>
          <p className={`text-body font-black ${sideTone(item.direction)}`}>{item.dealt}</p>
        </div>
        {showHint ? (
          <div className="mt-2 inline-flex items-center gap-1 text-label text-[#c4b6a7]">
            <span>查看详情</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>("status");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async (cancelledRef: { current: boolean }) => {
      setLoadState("loading");
      try {
        const [activeOrderRows, historyRows] = await Promise.all([
          tradingApiClient.getActiveOrders(),
          tradingApiClient.getTradeHistory(),
        ]);

        if (cancelledRef.current) {
          return;
        }

        setActiveOrders(activeOrderRows);
        setHistory(historyRows);
        setLoadState(activeOrderRows.length || historyRows.length ? "success" : "empty");
      } catch {
        if (!cancelledRef.current) {
          setLoadState("error");
        }
      }
  }, []);

  useEffect(() => {
    const cancelledRef = { current: false };

    void loadData(cancelledRef);

    return () => {
      cancelledRef.current = true;
    };
  }, [loadData, refreshKey]);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: string; message?: string }>;
      if (customEvent.detail?.type === "cancel_success") {
        setToastMessage(customEvent.detail.message || "取消订单成功");
      }
      setRefreshKey((current) => current + 1);
    };
    window.addEventListener("trade-order-updated", listener);
    return () => window.removeEventListener("trade-order-updated", listener);
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const filteredHoldings = useMemo(
    () => filterActiveOrders(activeOrders, statusFilter).map(mapOrderToRecordCard),
    [activeOrders, statusFilter]
  );

  const { groupedRecords, historyDates } = useMemo(
    () => groupTradeHistoryByDate(history),
    [history]
  );

  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+82px)]">
      <div className="min-h-full bg-white">
        <div className="overflow-hidden bg-[linear-gradient(180deg,#ffb55c_0%,#ff9320_58%,#d96d00_100%)] pt-[max(env(safe-area-inset-top),14px)] text-white shadow-[0_14px_28px_rgba(171,86,0,0.16)]">
            <div className="flex items-center justify-between px-4 pb-5">
            <div className="flex items-center gap-1 text-body font-black tracking-[0.03em]">
              <span>AASTOCKS</span>
              <span className="text-label opacity-85">↗</span>
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
              className={`relative h-12 text-title font-black ${
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
              className={`relative h-12 text-title font-black ${
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
          <div className="text-helper flex items-center gap-1 font-black text-[#8f7a66]">
            <span>🇭🇰</span>
            <span>货币 (港币)</span>
          </div>
        </div>

        {loadState === "loading" ? (
          <div className="space-y-3 px-4 py-5">
            <div className="state-skeleton h-16 w-full" />
            <div className="state-skeleton h-16 w-full" />
            <div className="state-skeleton h-16 w-full" />
          </div>
        ) : loadState === "error" ? (
          <div className="px-4 py-10 text-center">
            <p className="text-body font-semibold text-[#8f7a66]">读取交易数据失败</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mt-4 px-4"
            >
              重新载入
            </button>
          </div>
        ) : loadState === "empty" ? (
          <div className="px-4 py-10 text-center">
            <p className="text-body font-semibold text-[#8f7a66]">暂无港股交易记录</p>
            <p className="text-helper mt-1 text-[#b39a80]">完成下单后可在此查看状态与历史</p>
          </div>
        ) : activeTab === "status" ? (
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
                    className={`h-9 rounded-full px-3 text-body font-black ${
                      statusFilter === item.key
                        ? "bg-[var(--app-orange-dark)] text-white"
                        : "bg-transparent text-[#7f7f7f]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[#efe7dc]">
              {filteredHoldings.map((item) => (
                <TradeTrigger
                  key={item.orderId}
                  symbol={item.symbol}
                  variant="order"
                  orderId={item.orderId}
                  orderStatus={item.status}
                  className="mx-3 my-2 block rounded-[14px] border border-[#f1e6d8] bg-[#fffdf9] px-3 py-3 text-left active:bg-[#fffaf3]"
                >
                  <OrderCard item={item} showHint />
                </TradeTrigger>
              ))}
            </div>
          </>
        ) : (
          <div className="pb-10">
            {historyDates.map((date) => (
              <div key={date}>
                <div className="text-helper border-b border-[#efe7dc] px-4 py-2 font-black text-[#beb0a1]">
                  {date}
                </div>

                <div className="divide-y divide-[#efe7dc]">
                  {groupedRecords[date].map((item) => (
                    <div
                      key={`${item.symbol}-${item.time}-${item.orderId}`}
                      className="mx-3 my-2 rounded-[14px] border border-[#f1e6d8] bg-[#fffdf9] px-3 py-3"
                    >
                      <OrderCard item={item} showHint={false} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-40 flex justify-center px-4">
          <div className="rounded-full bg-[#2f2c28] px-4 py-2 text-helper font-semibold text-white shadow-[0_10px_22px_rgba(0,0,0,0.2)]">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </AppScreen>
  );
}
