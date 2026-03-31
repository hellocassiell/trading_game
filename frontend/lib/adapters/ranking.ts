import { tradingApiClient } from "../api";
import type {
  Position,
  StarTraderLeaderboardItem,
  TopHoldingsLeaderboardItem,
  TopLoserHoldingsLeaderboardItem,
  TopTurnoverLeaderboardItem,
  ViewStatus,
} from "../api/types";
import type { AppLanguage } from "../locale";
import { byLanguage } from "../locale";

type RankingHoldingItem = {
  symbol: string;
  quantity: string;
  available: string;
  profit: string;
  currentPrice: string;
  change: string;
  referenceValue: string;
  positive: boolean;
};

type RankingFeaturedItem = {
  name: string;
  tag: string;
  intro: string;
  marketValue: string;
  cash: string;
  totalAssets: string;
  chartLabels: readonly string[];
  chartValues: readonly number[];
  updatedAt: string;
};

type RankingTabItem = {
  featured: RankingFeaturedItem;
  holdingsTitle: string;
  holdings: RankingHoldingItem[];
};

export type RankingPageData = {
  status: ViewStatus;
  starParticipants: {
    tabs: string[];
    currencyLabel: string;
    items: Record<string, RankingTabItem>;
    disclaimer: string;
    footerUpdatedAt: string;
  };
};

export type TopVolumePageData = {
  status: ViewStatus;
  buyRows: Array<{ symbol: string; name: string; price: string }>;
  sellRows: Array<{ symbol: string; name: string; price: string }>;
  updatedAt: string;
};

export type TopHoldingsPageData = {
  status: ViewStatus;
  rows: Array<{ symbol: string; name: string; value: string; delta: "▲" | "▼" | "-" }>;
  updatedAt: string;
};

export type TopLoserHoldingsPageData = {
  status: ViewStatus;
  rows: Array<{ symbol: string; name: string; loss: string; delta: "▲" | "▼" | "-" }>;
  updatedAt: string;
};

function formatNumber(value: number, fractionDigits = 2) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatSignedPercent(value: number) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toFixed(2)}%`;
}

function formatSignedAmount(value: number) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : safe < 0 ? "-" : "";
  return `${sign}${Math.abs(safe).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function displayStockCode(stockCode: string) {
  const normalized = stockCode.trim().toUpperCase().replace(/\.HK$/, "");
  if (/^0\d{4}$/.test(normalized)) {
    return normalized.slice(1);
  }
  return normalized;
}

function formatCompactHkd(value: number) {
  const safe = Number(value ?? 0);
  if (safe >= 100_000_000) {
    return `${(safe / 100_000_000).toFixed(1)} 亿港元`;
  }
  if (safe >= 10_000) {
    return `${(safe / 10_000).toFixed(1)} 万港元`;
  }
  return `${safe.toLocaleString("en-US", { maximumFractionDigits: 0 })} 港元`;
}

function buildChartSeries(changePercent: number, rank: number, lang: AppLanguage) {
  const labels = byLanguage(lang, {
    "zh-Hant": ["26/04", "27/04", "28/04", "29/04", "今日"],
    "zh-Hans": ["26/04", "27/04", "28/04", "29/04", "今日"],
    en: ["26/04", "27/04", "28/04", "29/04", "Today"],
  });
  const safe = Math.max(-20, Math.min(20, Number(changePercent ?? 0)));
  const start = 74 - safe;
  const end = 74 + safe;
  const drift = (rank % 3) - 1;
  const points = [0, 0.28, 0.55, 0.8, 1].map((ratio) => {
    const raw = start + (end - start) * ratio + drift * 2;
    return Math.max(24, Math.min(126, Math.round(raw)));
  });
  return { labels, values: points };
}

function localizeStarSummary(star: StarTraderLeaderboardItem, lang: AppLanguage) {
  const localized: Record<string, { name: string; tag: string; intro: string }> = byLanguage(lang, {
    "zh-Hant": {
      青姐: {
        name: "青姐",
        tag: "獨立股評人",
        intro: "留意強勢科技股回調後的承接力，優先觀察 0700 騰訊控股 與 9988 阿里巴巴-SW。",
      },
      沈大师: {
        name: "沈大師",
        tag: "港股策略達人",
        intro: "港股 ETF 與藍籌輪動，關注 0388 香港交易所 與 2800 盈富基金。",
      },
      沈大師: {
        name: "沈大師",
        tag: "港股策略達人",
        intro: "港股 ETF 與藍籌輪動，關注 0388 香港交易所 與 2800 盈富基金。",
      },
      "英sir": {
        name: "英sir",
        tag: "技術派操盤手",
        intro: "波動行情下嚴控倉位，關注 3690 美團-W 與 1211 比亞迪股份。",
      },
    },
    "zh-Hans": {
      青姐: {
        name: "青姐",
        tag: "独立股评人",
        intro: "留意强势科技股回调后的承接力，优先观察 0700 腾讯控股 与 9988 阿里巴巴-SW。",
      },
      沈大师: {
        name: "沈大师",
        tag: "港股策略达人",
        intro: "港股 ETF 与蓝筹轮动，关注 0388 香港交易所 与 2800 盈富基金。",
      },
      沈大師: {
        name: "沈大师",
        tag: "港股策略达人",
        intro: "港股 ETF 与蓝筹轮动，关注 0388 香港交易所 与 2800 盈富基金。",
      },
      "英sir": {
        name: "英sir",
        tag: "技术派操盘手",
        intro: "波动行情下严控仓位，关注 3690 美团-W 与 1211 比亚迪股份。",
      },
    },
    en: {
      青姐: {
        name: "Ching",
        tag: "Independent Analyst",
        intro: "Watching tech pullbacks, focusing on 0700 Tencent and 9988 Alibaba-SW.",
      },
      沈大师: {
        name: "Shen",
        tag: "HK Strategy Mentor",
        intro: "Rotation between ETFs and blue chips, tracking 0388 HKEX and 2800 Tracker Fund.",
      },
      沈大師: {
        name: "Shen",
        tag: "HK Strategy Mentor",
        intro: "Rotation between ETFs and blue chips, tracking 0388 HKEX and 2800 Tracker Fund.",
      },
      "英sir": {
        name: "Eric",
        tag: "Technical Trader",
        intro: "Controlling risk in volatile sessions, watching 3690 Meituan-W and 1211 BYD.",
      },
    },
  });

  return localized[star.name] ?? {
    name: star.name,
    tag: star.tag,
    intro: star.intro,
  };
}

function buildRankingHoldingItem(position: Position): RankingHoldingItem {
  const positive = Number(position.pnlAmount ?? 0) >= 0;
  return {
    symbol: displayStockCode(position.stockCode),
    quantity: Number(position.quantity ?? 0).toLocaleString("en-US"),
    available: Number(position.tradableQuantity ?? 0).toLocaleString("en-US"),
    profit: formatSignedPercent(position.pnlPercent ?? 0),
    currentPrice: Number(position.currentPrice ?? 0).toFixed(3),
    change: `${formatSignedAmount(position.pnlAmount ?? 0)} (${formatSignedPercent(position.pnlPercent ?? 0)})`,
    referenceValue: formatNumber(position.referenceMarketValue ?? 0, 2),
    positive,
  };
}

function movementToArrow(item: TopHoldingsLeaderboardItem): "▲" | "▼" | "-" {
  if (item.movement === "UP") {
    return "▲";
  }
  if (item.movement === "DOWN") {
    return "▼";
  }

  const changeAmount = Number(item.changeAmount ?? 0);
  if (changeAmount > 0) {
    return "▲";
  }
  if (changeAmount < 0) {
    return "▼";
  }
  return "-";
}

function mapTopTurnoverItem(item: TopTurnoverLeaderboardItem) {
  return {
    symbol: displayStockCode(item.stockCode),
    name: item.stockName,
    price: formatCompactHkd(item.amount),
  };
}

function mapTopHoldingsItem(item: TopHoldingsLeaderboardItem) {
  return {
    symbol: displayStockCode(item.stockCode),
    name: item.stockName,
    value: formatCompactHkd(item.holdingValue),
    delta: movementToArrow(item),
  };
}

function mapTopLoserHoldingsItem(item: TopLoserHoldingsLeaderboardItem) {
  return {
    symbol: displayStockCode(item.stockCode),
    name: item.stockName,
    loss: formatCompactHkd(item.lossAmount),
    delta: "▼" as const,
  };
}

function buildRankingTabItem(
  star: StarTraderLeaderboardItem,
  positions: Position[],
  lang: AppLanguage,
  updatedAt: string,
  summary?: { name: string; tag: string; intro: string }
): RankingTabItem {
  const chart = buildChartSeries(star.changePercent ?? 0, star.rank ?? 1, lang);
  const localized = summary ?? localizeStarSummary(star, lang);
  const marketValue = Number(star.securitiesMarketValue ?? 0);
  const cashEstimate = Number(star.cashEstimate ?? Number(star.totalAssets ?? 0) - marketValue);
  const holdingsTitle = byLanguage(lang, {
    "zh-Hant": `港股持倉 - ${localized.name}`,
    "zh-Hans": `港股持仓 - ${localized.name}`,
    en: `HK Holdings - ${localized.name}`,
  });

  return {
    featured: {
      name: localized.name,
      tag: localized.tag,
      intro: localized.intro,
      marketValue: formatNumber(marketValue, 3),
      cash: formatNumber(cashEstimate, 3),
      totalAssets: formatNumber(Number(star.totalAssets ?? 0), 3),
      chartLabels: chart.labels,
      chartValues: chart.values,
      updatedAt,
    },
    holdingsTitle,
    holdings: positions.map(buildRankingHoldingItem),
  };
}

function buildRankingEmptyData(lang: AppLanguage): RankingPageData {
  const currencyLabel = byLanguage(lang, {
    "zh-Hant": "貨幣 (港幣)",
    "zh-Hans": "货币 (港币)",
    en: "Currency (HKD)",
  });
  const disclaimer = byLanguage(lang, {
    "zh-Hant": "以上星級推介均屬虛擬性質，只適用於比賽平台。",
    "zh-Hans": "以上星级推介均属虚拟性质，只适用于比赛平台。",
    en: "All star trader insights are virtual and for in-game reference only.",
  });

  return {
    status: "empty",
    starParticipants: {
      tabs: [],
      currencyLabel,
      items: {},
      disclaimer,
      footerUpdatedAt: "--",
    },
  };
}

export function createInitialRankingPageData(lang: AppLanguage): RankingPageData {
  return {
    ...buildRankingEmptyData(lang),
    status: "loading",
  };
}

export function createInitialTopVolumePageData(): TopVolumePageData {
  return {
    status: "loading",
    buyRows: [],
    sellRows: [],
    updatedAt: "--",
  };
}

export function createInitialTopHoldingsPageData(): TopHoldingsPageData {
  return {
    status: "loading",
    rows: [],
    updatedAt: "--",
  };
}

export function createInitialTopLoserHoldingsPageData(): TopLoserHoldingsPageData {
  return {
    status: "loading",
    rows: [],
    updatedAt: "--",
  };
}

export async function getRankingPageData(lang: AppLanguage, userId?: string): Promise<RankingPageData> {
  const empty = buildRankingEmptyData(lang);
  try {
    const payload = await tradingApiClient.getStarTraders(userId);
    const stars = (payload.items ?? []).slice(0, 3);
    if (!stars.length) {
      return empty;
    }

    const updatedAt = formatHktTime(payload.updatedAt);
    const summaries = stars.map((item) => localizeStarSummary(item, lang));
    const tabs = summaries.map((summary) => summary.name);
    const positionResults = await Promise.allSettled(
      stars.map((item) => tradingApiClient.getPositions(item.userId))
    );

    const items: Record<string, RankingTabItem> = {};
    stars.forEach((item, index) => {
      const positions =
        positionResults[index].status === "fulfilled"
          ? positionResults[index].value
          : [];
      const summary = summaries[index];
      items[summary.name] = buildRankingTabItem(item, positions, lang, updatedAt, summary);
    });

    return {
      status: "success",
      starParticipants: {
        tabs,
        currencyLabel: empty.starParticipants.currencyLabel,
        items,
        disclaimer: empty.starParticipants.disclaimer,
        footerUpdatedAt: updatedAt,
      },
    };
  } catch {
    return {
      ...empty,
      status: "error",
    };
  }
}

export async function getTopVolumePageData(): Promise<TopVolumePageData> {
  try {
    const payload = await tradingApiClient.getTopTurnoverLeaderboard();
    const buyRows = (payload.buy ?? []).map(mapTopTurnoverItem);
    const sellRows = (payload.sell ?? []).map(mapTopTurnoverItem);
    const hasData = buyRows.length > 0 || sellRows.length > 0;

    return {
      status: hasData ? "success" : "empty",
      buyRows,
      sellRows,
      updatedAt: formatHktTime(payload.updatedAt),
    };
  } catch {
    return {
      status: "error",
      buyRows: [],
      sellRows: [],
      updatedAt: "--",
    };
  }
}

export async function getTopHoldingsPageData(): Promise<TopHoldingsPageData> {
  try {
    const payload = await tradingApiClient.getTopHoldingsLeaderboard();
    const rows = (payload.items ?? []).map(mapTopHoldingsItem);

    return {
      status: rows.length ? "success" : "empty",
      rows,
      updatedAt: formatHktTime(payload.updatedAt),
    };
  } catch {
    return {
      status: "error",
      rows: [],
      updatedAt: "--",
    };
  }
}

export async function getTopLoserHoldingsPageData(): Promise<TopLoserHoldingsPageData> {
  try {
    const payload = await tradingApiClient.getTopLoserHoldingsLeaderboard();
    const rows = (payload.items ?? []).map(mapTopLoserHoldingsItem);

    return {
      status: rows.length ? "success" : "empty",
      rows,
      updatedAt: formatHktTime(payload.updatedAt),
    };
  } catch {
    return {
      status: "error",
      rows: [],
      updatedAt: "--",
    };
  }
}
