import type { AppLanguage } from "./locale";

const STOCK_NAME_MAP: Record<string, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  "0700": { "zh-Hant": "騰訊控股", "zh-Hans": "腾讯控股", en: "Tencent Holdings" },
  "00700": { "zh-Hant": "騰訊控股", "zh-Hans": "腾讯控股", en: "Tencent Holdings" },
  "9988": { "zh-Hant": "阿里巴巴-SW", "zh-Hans": "阿里巴巴-SW", en: "Alibaba-SW" },
  "09988": { "zh-Hant": "阿里巴巴-SW", "zh-Hans": "阿里巴巴-SW", en: "Alibaba-SW" },
  "0388": { "zh-Hant": "香港交易所", "zh-Hans": "香港交易所", en: "HKEX" },
  "2800": { "zh-Hant": "盈富基金", "zh-Hans": "盈富基金", en: "Tracker Fund of Hong Kong" },
  "1211": { "zh-Hant": "比亞迪股份", "zh-Hans": "比亚迪股份", en: "BYD Co." },
  "3690": { "zh-Hant": "美團-W", "zh-Hans": "美团-W", en: "Meituan-W" },
  "1810": { "zh-Hant": "小米集團-W", "zh-Hans": "小米集团-W", en: "Xiaomi-W" },
  "0005": { "zh-Hant": "滙豐控股", "zh-Hans": "汇丰控股", en: "HSBC Holdings" },
  "2318": { "zh-Hant": "中國平安", "zh-Hans": "中国平安", en: "Ping An" },
  "1299": { "zh-Hant": "友邦保險", "zh-Hans": "友邦保险", en: "AIA Group" },
  "9618": { "zh-Hant": "京東集團-SW", "zh-Hans": "京东集团-SW", en: "JD.com-SW" },
  "0941": { "zh-Hant": "中國移動", "zh-Hans": "中国移动", en: "China Mobile" },
  "0883": { "zh-Hant": "中國海洋石油", "zh-Hans": "中国海洋石油", en: "CNOOC" },
};

function normalizeStockCode(stockCode: string) {
  const raw = stockCode.trim().toUpperCase().replace(/\.HK$/, "");
  if (/^\d{5}$/.test(raw) && raw.startsWith("0")) {
    return raw.slice(1);
  }
  return raw;
}

export function localizeStockName(stockCode: string, fallback: string, language: AppLanguage) {
  const normalized = normalizeStockCode(stockCode);
  const mapped = STOCK_NAME_MAP[normalized] ?? STOCK_NAME_MAP[stockCode];
  if (mapped) {
    return mapped[language];
  }
  return fallback;
}

export function localizeStockValueText(value: string, language: AppLanguage) {
  if (language === "zh-Hans") {
    return value;
  }
  if (language === "zh-Hant") {
    return value
      .replace(/亿港元/g, "億港元")
      .replace(/万港元/g, "萬港元")
      .replace(/港币/g, "港幣");
  }

  const yiMatch = value.match(/^([\d.]+)\s*[亿億]港元$/);
  if (yiMatch) {
    const amount = Number(yiMatch[1]);
    if (Number.isFinite(amount)) {
      return `${(amount * 0.1).toFixed(2)}B HKD`;
    }
  }

  const wanMatch = value.match(/^([\d.]+)\s*[万萬]港元$/);
  if (wanMatch) {
    const amount = Number(wanMatch[1]);
    if (Number.isFinite(amount)) {
      const thousand = amount * 10;
      return `${thousand.toFixed(1)}K HKD`;
    }
  }

  return value
    .replace(/港币/g, "HKD")
    .replace(/港幣/g, "HKD")
    .replace(/港元/g, "HKD");
}

