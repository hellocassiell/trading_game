export type AppLanguage = "zh-Hant" | "zh-Hans" | "en";
export type LanguageMap<T> = Record<AppLanguage, T>;

const LANGUAGE_STORAGE_KEY = "trading-game.language";
export const DEFAULT_LANGUAGE: AppLanguage = "zh-Hant";
export const SUPPORTED_LANGUAGES: AppLanguage[] = ["zh-Hant", "zh-Hans", "en"];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  en: "English",
};

const translations: Record<AppLanguage, Record<string, string>> = {
  "zh-Hant": {
    "nav.home": "首頁",
    "nav.profile": "個人",
    "nav.records": "記錄",
    "nav.more": "更多",
    "nav.trade": "交易",
  "more.languageTitle": "語言設定",
  "more.languageHint": "切換語言後，介面與後端資料會一起更新",
  "more.logout": "退出登入",
    "more.pageTitle": "更多",
    "more.quickEntry.rank.title": "排行榜擴展",
    "more.quickEntry.rank.desc": "進入 10 大成交、20 大持倉和星級參賽者",
    "more.market.sectionTitle": "榜單與頁面",
    "more.market.ranking": "排行榜",
    "more.market.topVolume": "今日10大成交港股",
    "more.market.topHoldings": "參賽者20大港股持倉",
    "more.market.starTraders": "星級參賽者",
    "profile.brandName": "AASTOCKS",
    "profile.rankLabel": "排名",
    "profile.dailyTrades": "每天可供交易次數",
    "profile.dailyTradesRemainingPrefix": "尚餘",
    "profile.weeklyTradesPrefix": "每周需交易",
    "profile.weeklyTradesRemainingPrefix": "尚欠",
    "profile.timesSuffix": "次",
    "profile.initialCapital": "起始資金",
    "profile.bonus": "額外獎賞",
    "profile.portfolioValue": "證券參考市值",
    "profile.availableCash": "可投資餘額",
    "profile.totalAssets": "資產總值",
    "profile.today": "今日",
    "profile.updatedAtPrefix": "資料更新",
    "profile.holdingsTitle": "港股持倉",
    "profile.currencyLabel": "貨幣 (港元)",
  },
  "zh-Hans": {
    "nav.home": "首页",
    "nav.profile": "个人",
    "nav.records": "记录",
    "nav.more": "更多",
    "nav.trade": "交易",
    "more.languageTitle": "语言设置",
    "more.languageHint": "切换语言后，界面与后端数据会一起更新",
    "more.logout": "退出登录",
    "more.pageTitle": "更多",
    "more.quickEntry.rank.title": "排行榜扩展",
    "more.quickEntry.rank.desc": "进入 10 大成交、20 大持仓和星级参赛者",
    "more.market.sectionTitle": "榜单与页面",
    "more.market.ranking": "排行榜",
    "more.market.topVolume": "今日10大成交港股",
    "more.market.topHoldings": "参赛者20大港股持仓",
    "more.market.starTraders": "星级参赛者",
    "profile.brandName": "AASTOCKS",
    "profile.rankLabel": "排名",
    "profile.dailyTrades": "每天可供交易次数",
    "profile.dailyTradesRemainingPrefix": "尚余",
    "profile.weeklyTradesPrefix": "每周需交易",
    "profile.weeklyTradesRemainingPrefix": "尚欠",
    "profile.timesSuffix": "次",
    "profile.initialCapital": "起始资金",
    "profile.bonus": "额外奖赏",
    "profile.portfolioValue": "证券参考市值",
    "profile.availableCash": "可投资余额",
    "profile.totalAssets": "资产总值",
    "profile.today": "今日",
    "profile.updatedAtPrefix": "资料更新",
    "profile.holdingsTitle": "港股持仓",
    "profile.currencyLabel": "货币 (港元)",
  },
  en: {
    "nav.home": "Home",
    "nav.profile": "Profile",
    "nav.records": "Records",
    "nav.more": "More",
    "nav.trade": "Trade",
    "more.languageTitle": "Language",
    "more.languageHint": "Switching language keeps UI and backend aligned",
    "more.logout": "Log out",
    "more.pageTitle": "More",
    "more.quickEntry.rank.title": "Ranking shortcuts",
    "more.quickEntry.rank.desc": "Jump to Top Turnover, Top Holdings, and Star Traders",
    "more.market.sectionTitle": "Lists & Pages",
    "more.market.ranking": "Ranking",
    "more.market.topVolume": "Today’s Top 10 Turnover (HK)",
    "more.market.topHoldings": "Top 20 HK Holdings (Players)",
    "more.market.starTraders": "Star Traders",
    "profile.brandName": "AASTOCKS",
    "profile.rankLabel": "Rank",
    "profile.dailyTrades": "Daily trade quota",
    "profile.dailyTradesRemainingPrefix": "Remaining",
    "profile.weeklyTradesPrefix": "Weekly required",
    "profile.weeklyTradesRemainingPrefix": "Left",
    "profile.timesSuffix": "times",
    "profile.initialCapital": "Initial capital",
    "profile.bonus": "Bonus",
    "profile.portfolioValue": "Portfolio reference value",
    "profile.availableCash": "Available cash",
    "profile.totalAssets": "Total assets",
    "profile.today": "Today",
    "profile.updatedAtPrefix": "Updated at",
    "profile.holdingsTitle": "HK Holdings",
    "profile.currencyLabel": "Currency (HKD)",
  },
};

export function byLanguage<T>(lang: AppLanguage, values: LanguageMap<T>): T {
  return values[lang] ?? values[DEFAULT_LANGUAGE];
}

export function translate(lang: AppLanguage, key: string): string {
  return translations[lang]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!value) {
    return DEFAULT_LANGUAGE;
  }
  if (SUPPORTED_LANGUAGES.includes(value as AppLanguage)) {
    return value as AppLanguage;
  }
  return DEFAULT_LANGUAGE;
}

export function writeStoredLanguage(lang: AppLanguage) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export function detectBrowserLanguage(acceptLanguage?: string): AppLanguage {
  if (acceptLanguage) {
    const tags = acceptLanguage.split(",").map((item) => item.trim().toLowerCase());
    for (const tag of tags) {
      if (tag.startsWith("zh-hant") || tag.startsWith("zh-tw") || tag.startsWith("zh-hk")) {
        return "zh-Hant";
      }
      if (tag.startsWith("zh-hans") || tag.startsWith("zh-cn")) {
        return "zh-Hans";
      }
      if (tag.startsWith("en")) {
        return "en";
      }
    }
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    const normalized = navigator.language.toLowerCase();
    if (normalized.includes("zh-hant") || normalized.includes("zh-tw") || normalized.includes("zh-hk")) {
      return "zh-Hant";
    }
    if (normalized.includes("zh-hans") || normalized.includes("zh-cn")) {
      return "zh-Hans";
    }
    if (normalized.startsWith("en")) {
      return "en";
    }
  }
  return DEFAULT_LANGUAGE;
}

export function getPreferredLanguage(): AppLanguage {
  const stored = readStoredLanguage();
  return stored;
}
