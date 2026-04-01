import { appMeta as mockAppMeta } from "../app-meta";
import { tradingApiClient } from "../api";
import type { HomeOverviewPayload, ViewStatus } from "../api/types";
import type { AppLanguage } from "../locale";
import { byLanguage } from "../locale";

type EventStatItem = {
  label: string;
  primary: string;
  secondary: string;
  icon: "users" | "value" | "coin" | "repeat";
};

type StarItem = {
  userId: string;
  name: string;
  avatar: string;
  tag: string;
  intro: string;
  totalAssets: string;
  holding: string;
  recentTrade: string;
};

type HoldingCloudItem = {
  rank: string;
  symbol: string;
  value: string;
  unit: string;
  size: number;
  left: number;
  top: number;
};

type WeeklyFlyerItem = {
  name: string;
  tag: string;
  period: string;
  gainLabel: string;
  gain: string;
  riseLabel: string;
  rise: string;
};

type RankingRow = {
  rank: string;
  movement: "up" | "down" | "flat";
  name: string;
  avatar: string;
  amount: string;
  gain: string;
};

export type HomePageData = {
  status: ViewStatus;
  appMeta: typeof mockAppMeta;
  eventStats: EventStatItem[];
  eventStatsUpdatedAt: string;
  summaryCard: {
    name: string;
    avatar: string;
    rank: string;
    rankRise: string;
    dailyTrades: string;
    dailyTradesValue: string;
    requiredTrades: string;
    requiredTradesValue: string;
    referenceValue: string;
    cash: string;
    totalAssets: string;
    updatedAt: string;
  };
  starParticipants: {
    tabs: string[];
    items: Record<string, StarItem>;
  };
  holdingCloud: HoldingCloudItem[];
  holdingCloudUpdatedAt: string;
  volumeSnapshot: {
    buy: {
      label: string;
      symbol: string;
      amountLabel: string;
      amount: string;
    };
    sell: {
      label: string;
      symbol: string;
      amountLabel: string;
      amount: string;
    };
  };
  volumeSnapshotUpdatedAt: string;
  weeklyFlyers: {
    tabs: string[];
    items: Record<string, WeeklyFlyerItem>;
  };
  rankingRows: RankingRow[];
  rankingUpdatedAt: string;
};

const HOLDING_LAYOUT = [
  { size: 88, left: 8, top: 34 },
  { size: 102, left: 72, top: 88 },
  { size: 128, left: 142, top: 12 },
  { size: 110, left: 226, top: 92 },
  { size: 92, left: 286, top: 28 },
] as const;

function formatNumber(value: number, fractionDigits = 2) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatCurrency(value: number, lang: AppLanguage) {
  return lang === "en" ? `HK$${formatNumber(value, 2)}` : `${formatNumber(value, 2)} 港元`;
}

function formatPercent(value: number) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toFixed(2)}%`;
}

function formatCompactAmount(value: number, lang: AppLanguage) {
  const safe = Number(value ?? 0);
  if (lang === "en") {
    if (safe >= 1_000_000) {
      return {
        value: (safe / 1_000_000).toFixed(1),
        unit: "M HKD",
      };
    }
    return {
      value: safe.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      unit: "HKD",
    };
  }
  if (safe >= 100_000_000) {
    return { value: (safe / 100_000_000).toFixed(1), unit: "億港元" };
  }
  if (safe >= 10_000) {
    return { value: (safe / 10_000).toFixed(1), unit: "萬港元" };
  }
  return { value: safe.toLocaleString("en-US", { maximumFractionDigits: 0 }), unit: "港元" };
}

function formatHktTime(isoTime?: string | null) {
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

function mapEventStats(payload: HomeOverviewPayload, lang: AppLanguage): EventStatItem[] {
  const eventStats = payload.eventStats;
  const labels = byLanguage(lang, {
    "zh-Hant": {
      participants: "累計參加人數",
      holdingValue: "共持有資產總值",
      turnover: "賽事交易金額",
      trades: "賽事交易次數",
      today: "今日",
      total: "累計",
    },
    "zh-Hans": {
      participants: "累计参加人数",
      holdingValue: "共持有资产总值",
      turnover: "赛事交易金额",
      trades: "赛事交易次数",
      today: "今日",
      total: "累计",
    },
    en: {
      participants: "Participants",
      holdingValue: "Holding Asset Value",
      turnover: "Turnover",
      trades: "Trade Count",
      today: "Today",
      total: "Total",
    },
  });

  const todayAmount = eventStats.todayTradingAmount ?? eventStats.tradingAmount;
  const totalAmount = eventStats.totalTradingAmount ?? eventStats.tradingAmount;
  const todayCount = eventStats.todayTradingCount ?? eventStats.tradingCount;
  const totalCount = eventStats.totalTradingCount ?? eventStats.tradingCount;

  return [
    {
      icon: "users",
      label: labels.participants,
      primary: formatNumber(eventStats.participantCount, 0),
      secondary: "",
    },
    {
      icon: "value",
      label: labels.holdingValue,
      primary: formatCurrency(eventStats.holdingAssetValue, lang),
      secondary: "",
    },
    {
      icon: "coin",
      label: labels.turnover,
      primary: `${labels.today} ${formatCurrency(todayAmount, lang)}`,
      secondary: `${labels.total} ${formatCurrency(totalAmount, lang)}`,
    },
    {
      icon: "repeat",
      label: labels.trades,
      primary: `${labels.today} ${formatNumber(todayCount, 0)}`,
      secondary: `${labels.total} ${formatNumber(totalCount, 0)}`,
    },
  ];
}

function mapStarParticipants(payload: HomeOverviewPayload): HomePageData["starParticipants"] {
  const tabs = (payload.starParticipants?.tabs ?? []).slice(0, 3);
  const rawItems = payload.starParticipants?.items ?? {};
  const items: Record<string, StarItem> = {};
  for (const tab of tabs) {
    const source = rawItems[tab];
    if (!source) {
      continue;
    }
    items[tab] = {
      userId: source.userId ?? "",
      name: source.name,
      avatar: source.avatar ?? "",
      tag: source.tag,
      intro: source.intro,
      totalAssets: formatNumber(source.totalAssets, 2),
      holding: source.holding ?? (source.topHolding?.split(" ")[0] ?? "--"),
      recentTrade: source.recentTrade,
    };
  }
  return { tabs, items };
}

function mapHoldingCloud(payload: HomeOverviewPayload, lang: AppLanguage): HoldingCloudItem[] {
  const items = payload.topHoldings?.items ?? [];
  return items.slice(0, 5).map((item, index) => {
    const compact = formatCompactAmount(item.holdingValue, lang);
    const rank = lang === "en" ? `#${index + 1}` : `第${index + 1}名`;
    const layout = HOLDING_LAYOUT[index] ?? HOLDING_LAYOUT[HOLDING_LAYOUT.length - 1];
    return {
      rank,
      symbol: item.stockCode,
      value: compact.value,
      unit: compact.unit,
      size: layout.size,
      left: layout.left,
      top: layout.top,
    };
  });
}

function mapVolumeSnapshot(payload: HomeOverviewPayload, lang: AppLanguage): HomePageData["volumeSnapshot"] {
  const labels = byLanguage(lang, {
    "zh-Hant": {
      buyLabel: "最多參賽者買入",
      sellLabel: "最多參賽者賣出",
      buyAmountLabel: "總買入金額",
      sellAmountLabel: "總賣出金額",
    },
    "zh-Hans": {
      buyLabel: "最多参赛者买入",
      sellLabel: "最多参赛者卖出",
      buyAmountLabel: "总买入金额",
      sellAmountLabel: "总卖出金额",
    },
    en: {
      buyLabel: "Most Bought by Players",
      sellLabel: "Most Sold by Players",
      buyAmountLabel: "Total Buy Amount",
      sellAmountLabel: "Total Sell Amount",
    },
  });

  const topBuy = payload.topTurnover?.buy?.[0];
  const topSell = payload.topTurnover?.sell?.[0];

  return {
    buy: {
      label: labels.buyLabel,
      symbol: topBuy?.stockCode ?? "--",
      amountLabel: labels.buyAmountLabel,
      amount: topBuy ? formatCurrency(topBuy.amount, lang) : formatCurrency(0, lang),
    },
    sell: {
      label: labels.sellLabel,
      symbol: topSell?.stockCode ?? "--",
      amountLabel: labels.sellAmountLabel,
      amount: topSell ? formatCurrency(topSell.amount, lang) : formatCurrency(0, lang),
    },
  };
}

function mapWeeklyFlyers(payload: HomeOverviewPayload): HomePageData["weeklyFlyers"] {
  const tabs = payload.weeklyFlyers?.tabs ?? [];
  const rawItems = payload.weeklyFlyers?.items ?? {};
  const items: Record<string, WeeklyFlyerItem> = {};
  for (const tab of tabs) {
    const source = rawItems[tab];
    if (!source) {
      continue;
    }
    items[tab] = {
      name: source.name,
      tag: source.tag,
      period: source.period,
      gainLabel: source.gainLabel,
      gain: source.gain,
      riseLabel: source.riseLabel,
      rise: String(source.rise),
    };
  }
  return { tabs, items };
}

function mapRankingRows(payload: HomeOverviewPayload): RankingRow[] {
  const rows = payload.ranking ?? [];
  return rows.slice(0, 6).map((item) => ({
    rank: String(item.rank),
    movement: item.rankMovement === "UP" ? "up" : item.rankMovement === "DOWN" ? "down" : "flat",
    name: item.nickname,
    avatar: item.avatar ?? "",
    amount: `HK$${formatNumber(item.totalAssets, 2)}`,
    gain: formatPercent(item.changePercent),
  }));
}

function buildEmptyData(status: ViewStatus): HomePageData {
  return {
    status,
    appMeta: mockAppMeta,
    eventStats: [],
    eventStatsUpdatedAt: "--",
    summaryCard: {
      name: "",
      avatar: "",
      rank: "-",
      rankRise: "0",
      dailyTrades: "",
      dailyTradesValue: "0",
      requiredTrades: "",
      requiredTradesValue: "0",
      referenceValue: "0.00",
      cash: "0.00",
      totalAssets: "0.00",
      updatedAt: "--",
    },
    starParticipants: {
      tabs: [],
      items: {},
    },
    holdingCloud: [],
    holdingCloudUpdatedAt: "--",
    volumeSnapshot: {
      buy: { label: "", symbol: "--", amountLabel: "", amount: "0" },
      sell: { label: "", symbol: "--", amountLabel: "", amount: "0" },
    },
    volumeSnapshotUpdatedAt: "--",
    weeklyFlyers: {
      tabs: [],
      items: {},
    },
    rankingRows: [],
    rankingUpdatedAt: "--",
  };
}

export function createInitialHomePageData(): HomePageData {
  return buildEmptyData("loading");
}

export async function getHomePageData(language: AppLanguage, userId?: string): Promise<HomePageData> {
  try {
    const overview = await tradingApiClient.getHomeOverview(userId);
    const summary = overview.mySummary;

    const data: HomePageData = {
      status: (overview.eventStats.participantCount ?? 0) > 0 ? "success" : "empty",
      appMeta: {
        ...mockAppMeta,
        sponsor: overview.competition?.sponsor ?? mockAppMeta.sponsor,
        competition: overview.competition?.name ?? mockAppMeta.competition,
      },
      eventStats: mapEventStats(overview, language),
      eventStatsUpdatedAt: formatHktTime(
        overview.eventStats.updatedAt ?? overview.competition.updatedAt
      ),
      summaryCard: {
        name: summary.nickname,
        avatar: summary.avatar ?? "",
        rank: String(summary.rank),
        rankRise: String(summary.rankDelta),
        dailyTrades: byLanguage(language, {
          "zh-Hant": "每天可供交易次數",
          "zh-Hans": "每天可供交易次数",
          en: "Daily trading quota",
        }),
        dailyTradesValue: String(summary.dailyTradesRemaining),
        requiredTrades: byLanguage(language, {
          "zh-Hant": `每周需交易${summary.weeklyTradesRequired}次`,
          "zh-Hans": `每周需交易${summary.weeklyTradesRequired}次`,
          en: `Weekly required ${summary.weeklyTradesRequired}`,
        }),
        requiredTradesValue: String(summary.weeklyTradesRemaining),
        referenceValue: formatNumber(summary.securitiesMarketValue, 2),
        cash: formatNumber(summary.cashAvailable, 2),
        totalAssets: formatNumber(summary.totalAssets, 2),
        updatedAt: formatHktTime(summary.updatedAt),
      },
      starParticipants: mapStarParticipants(overview),
      holdingCloud: mapHoldingCloud(overview, language),
      holdingCloudUpdatedAt: formatHktTime(
        overview.topHoldings?.updatedAt ?? overview.competition.updatedAt
      ),
      volumeSnapshot: mapVolumeSnapshot(overview, language),
      volumeSnapshotUpdatedAt: formatHktTime(
        overview.topTurnover?.updatedAt ?? overview.competition.updatedAt
      ),
      weeklyFlyers: mapWeeklyFlyers(overview),
      rankingRows: mapRankingRows(overview),
      rankingUpdatedAt: formatHktTime(
        overview.rankingUpdatedAt ?? overview.competition.updatedAt
      ),
    };

    if (
      data.eventStats.length === 0 &&
      data.starParticipants.tabs.length === 0 &&
      data.holdingCloud.length === 0 &&
      data.rankingRows.length === 0
    ) {
      return buildEmptyData("empty");
    }

    return data;
  } catch {
    return buildEmptyData("error");
  }
}
