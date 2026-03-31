import type { ActiveOrder, TradeHistoryItem } from "../api";
import { byLanguage, getPreferredLanguage } from "../locale";

export type StatusFilter = "all" | "pending" | "done";

function formatHktTime(isoTime: string | null) {
  if (!isoTime) {
    return "--";
  }

  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) {
    return isoTime;
  }

  const formatter = new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute} HKT`;
}

export function filterActiveOrders(activeOrders: ActiveOrder[], statusFilter: StatusFilter) {
  if (statusFilter === "pending") {
    return activeOrders.filter((item) => item.status === "PENDING" || item.status === "PARTIAL_FILLED");
  }

  if (statusFilter === "done") {
    return activeOrders.filter((item) => item.status === "FILLED");
  }

  return activeOrders;
}

export function mapOrderToRecordCard(item: ActiveOrder | TradeHistoryItem) {
  return {
    ...item,
    symbol: item.stockCode,
    name: item.stockName,
    time: formatHktTime(item.createdAt),
    dealt: item.filledQuantity.toLocaleString("en-US"),
  };
}

export function groupTradeHistoryByDate(history: TradeHistoryItem[]) {
  const language = getPreferredLanguage();
  const unknownDate = byLanguage(language, {
    "zh-Hant": "未知日期",
    "zh-Hans": "未知日期",
    en: "Unknown Date",
  });

  const groupedRecords = history.reduce<Record<string, ReturnType<typeof mapOrderToRecordCard>[]>>(
    (accumulator, item) => {
      const mappedItem = mapOrderToRecordCard(item);
      const dateLabel = mappedItem.time.split(" ")[0] || unknownDate;
      accumulator[dateLabel] ??= [];
      accumulator[dateLabel].push(mappedItem);
      return accumulator;
    },
    {}
  );

  const historyDates = Object.keys(groupedRecords).sort((left, right) => (left < right ? 1 : -1));
  return { groupedRecords, historyDates };
}
