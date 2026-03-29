export const appMeta = {
  brand: "AASTOCKS",
  sponsor: "Citi",
  competition: "智财投资大赛2026",
  subtitle: "港股模拟投资大赛",
};

export const homeStats = [
  { label: "总参赛人数", value: "223,563", note: "只计算有交易纪录之参赛者" },
  { label: "累计总交易宗数", value: "89,562宗", note: "截至今日 16:00" },
  { label: "累计总盈利(港元)", value: "+HK$151,566", note: "较昨日上升 2.9%", positive: true },
] as const;

export const summaryStats = [
  { label: "总市值", value: "HK$ 1,053,153", sub: "持仓证券 3 只" },
  { label: "可用资金", value: "HK$ 947,321.40", sub: "今日余下交易 19 次" },
] as const;

export const profile = {
  name: "Joey Cheung",
  ranking: "12",
  rankLabel: "排名",
  wins: "2次",
  description: "稳健型选手，偏好科技与新能源板块",
  totalAssetsHkd: "1,000,000.000",
  todayPnl: "+5,206.90",
  todayPct: "+0.52%",
  cash: "947,321.40",
  portfolioValue: "52,678.60",
};

export const portfolioSummary = [
  { label: "总市值", value: "HK$ 1,053,153" },
  { label: "可用投资资金", value: "HK$ 947,321.40" },
  { label: "累计已实现盈亏", value: "+HK$ 23,510.00" },
  { label: "持仓股票", value: "3 只" },
] as const;

export const assetTrend = [
  { label: "26/04", value: 930000 },
  { label: "27/04", value: 956000 },
  { label: "28/04", value: 975000 },
  { label: "29/04", value: 1000000 },
] as const;

export const positions = [
  {
    symbol: "0700",
    name: "腾讯控股",
    quantity: "1,000",
    available: "1,000",
    averagePrice: "123.000",
    currentPrice: "133.480",
    pnl: "+5,206.90",
    pct: "+4.23%",
    positive: true,
  },
  {
    symbol: "9988",
    name: "阿里巴巴-SW",
    quantity: "2,000",
    available: "1,600",
    averagePrice: "82.300",
    currentPrice: "80.550",
    pnl: "-5,200.90",
    pct: "-2.13%",
    positive: false,
  },
  {
    symbol: "1211",
    name: "比亚迪股份",
    quantity: "500",
    available: "500",
    averagePrice: "194.600",
    currentPrice: "201.800",
    pnl: "+3,600.00",
    pct: "+3.70%",
    positive: true,
  },
] as const;

export const holdings = [
  {
    symbol: "0700",
    name: "腾讯控股",
    side: "买入",
    status: "排队中",
    statusTone: "queue",
    price: "323.400",
    dealt: "0",
    quantity: "100",
    time: "2021/04/21 22:08 HKT",
  },
  {
    symbol: "9988",
    name: "阿里巴巴-SW",
    side: "买入",
    status: "排队中",
    statusTone: "queue",
    price: "80.550",
    dealt: "0",
    quantity: "100",
    time: "2021/04/21 22:12 HKT",
  },
  {
    symbol: "1211",
    name: "比亚迪股份",
    side: "买入",
    status: "已成交",
    statusTone: "done",
    price: "201.800",
    dealt: "800",
    quantity: "800",
    time: "2021/04/21 22:10 HKT",
  },
  {
    symbol: "0388",
    name: "香港交易所",
    side: "卖出",
    status: "已成交",
    statusTone: "done",
    price: "245.600",
    dealt: "500",
    quantity: "500",
    time: "2021/04/21 22:15 HKT",
  },
] as const;

export const records = [
  {
    symbol: "0700",
    name: "腾讯控股",
    side: "买入",
    status: "已成交",
    statusTone: "done",
    price: "323.400",
    dealt: "800",
    quantity: "800",
    time: "2021/04/21 22:00 HKT",
  },
  {
    symbol: "9988",
    name: "阿里巴巴-SW",
    side: "卖出",
    status: "已取消",
    statusTone: "cancelled",
    price: "80.550",
    dealt: "0",
    quantity: "500",
    time: "2021/04/21 22:06 HKT",
  },
  {
    symbol: "1211",
    name: "比亚迪股份",
    side: "买入",
    status: "已成交",
    statusTone: "done",
    price: "201.800",
    dealt: "500",
    quantity: "500",
    time: "2021/04/20 21:56 HKT",
  },
] as const;

export const topVolumeTabs = [
  { key: "buy", label: "10大买入" },
  { key: "sell", label: "10大卖出" },
] as const;

export const topVolume = [
  { symbol: "0700", name: "腾讯控股", price: "20.2 万港元", delta: "▲" },
  { symbol: "9988", name: "阿里巴巴-SW", price: "19.9 万港元", delta: "▲" },
  { symbol: "3690", name: "美团-W", price: "19.6 万港元", delta: "▲" },
  { symbol: "1810", name: "小米集团-W", price: "19.3 万港元", delta: "▲" },
  { symbol: "1211", name: "比亚迪股份", price: "18.7 万港元", delta: "▼" },
  { symbol: "0005", name: "汇丰控股", price: "18.4 万港元", delta: "▲" },
  { symbol: "2318", name: "中国平安", price: "18.1 万港元", delta: "▲" },
  { symbol: "1299", name: "友邦保险", price: "17.8 万港元", delta: "▼" },
  { symbol: "0388", name: "香港交易所", price: "17.5 万港元", delta: "▲" },
] as const;

export const topVolumeSell = [
  { symbol: "1211", name: "比亚迪股份", price: "18.1 万港元", delta: "▼" },
  { symbol: "0700", name: "腾讯控股", price: "17.8 万港元", delta: "▼" },
  { symbol: "9988", name: "阿里巴巴-SW", price: "17.4 万港元", delta: "▼" },
  { symbol: "3690", name: "美团-W", price: "16.8 万港元", delta: "▼" },
  { symbol: "1810", name: "小米集团-W", price: "16.5 万港元", delta: "▼" },
  { symbol: "0005", name: "汇丰控股", price: "15.8 万港元", delta: "▼" },
  { symbol: "2318", name: "中国平安", price: "15.1 万港元", delta: "▼" },
  { symbol: "1299", name: "友邦保险", price: "14.8 万港元", delta: "▼" },
  { symbol: "0388", name: "香港交易所", price: "14.5 万港元", delta: "▼" },
] as const;

export const topHoldings = [
  { symbol: "0700", name: "腾讯控股", value: "22.5 亿港元", delta: "▲", strength: 100 },
  { symbol: "9988", name: "阿里巴巴-SW", value: "21.8 亿港元", delta: "▲", strength: 92 },
  { symbol: "3690", name: "美团-W", value: "21.1 亿港元", delta: "▲", strength: 88 },
  { symbol: "1810", name: "小米集团-W", value: "20.4 亿港元", delta: "▼", strength: 84 },
  { symbol: "1211", name: "比亚迪股份", value: "19.7 亿港元", delta: "▼", strength: 78 },
  { symbol: "2318", name: "中国平安", value: "19.3 亿港元", delta: "▼", strength: 72 },
  { symbol: "1299", name: "友邦保险", value: "18.3 亿港元", delta: "▲", strength: 67 },
  { symbol: "0388", name: "香港交易所", value: "17.6 亿港元", delta: "▲", strength: 62 },
  { symbol: "0005", name: "汇丰控股", value: "16.9 亿港元", delta: "▲", strength: 58 },
  { symbol: "9618", name: "京东集团-SW", value: "16.2 亿港元", delta: "▲", strength: 54 },
  { symbol: "0941", name: "中国移动", value: "15.5 亿港元", delta: "▼", strength: 50 },
  { symbol: "0883", name: "中国海洋石油", value: "14.8 亿港元", delta: "▼", strength: 45 },
] as const;

export const loserHoldings = [
  { symbol: "1211", name: "比亚迪股份", loss: "22.5 亿港元", delta: "▼", strength: 100 },
  { symbol: "1810", name: "小米集团-W", loss: "21.8 亿港元", delta: "▼", strength: 93 },
  { symbol: "9988", name: "阿里巴巴-SW", loss: "21.1 亿港元", delta: "▼", strength: 88 },
  { symbol: "3690", name: "美团-W", loss: "20.4 亿港元", delta: "▼", strength: 82 },
  { symbol: "2318", name: "中国平安", loss: "19.7 亿港元", delta: "▼", strength: 77 },
  { symbol: "1299", name: "友邦保险", loss: "19.3 亿港元", delta: "▼", strength: 74 },
  { symbol: "0388", name: "香港交易所", loss: "18.6 亿港元", delta: "▼", strength: 68 },
  { symbol: "0005", name: "汇丰控股", loss: "17.6 亿港元", delta: "▼", strength: 62 },
  { symbol: "9618", name: "京东集团-SW", loss: "16.9 亿港元", delta: "▼", strength: 57 },
  { symbol: "0941", name: "中国移动", loss: "16.2 亿港元", delta: "▼", strength: 52 },
  { symbol: "0883", name: "中国海洋石油", loss: "15.5 亿港元", delta: "▼", strength: 48 },
  { symbol: "0700", name: "腾讯控股", loss: "14.8 亿港元", delta: "▼", strength: 42 },
] as const;

export const strongestUsers = [
  { symbol: "0700", pct: "17%" },
  { symbol: "9988", pct: "17%" },
  { symbol: "1211", pct: "21%" },
  { symbol: "1810", pct: "12%" },
  { symbol: "3690", pct: "7%" },
] as const;

export const starParticipants = {
  tabs: ["青姐", "沈大师", "英sir"] as const,
  featured: {
    name: "青姐",
    tag: "独立股评人",
    intro: "留意强势科技股回调后的承接力，优先观察 0700 腾讯控股 与 9988 阿里巴巴-SW。",
    marketValue: "513,910.000",
    cash: "379,562.000",
    totalAssets: "947,321.640",
    chartLabels: ["26/04", "27/04", "28/04", "29/04", "今日"] as const,
    chartValues: [20, 24, 78, 118, 126] as const,
    updatedAt: "2021/04/21 22:00 HKT",
  },
  holdingsTitle: "港股持仓 - 青姐",
  currencyLabel: "货币 (港币)",
  holdings: [
    {
      symbol: "0700",
      quantity: "1,000",
      available: "1,000",
      profit: "+100.23%",
      currentPrice: "323.400",
      change: "+5.200 (1.63%)",
      referenceValue: "323,400",
      positive: true,
    },
    {
      symbol: "9988",
      quantity: "2,000",
      available: "2,000",
      profit: "-10.20%",
      currentPrice: "80.550",
      change: "-1.750 (2.13%)",
      referenceValue: "161,100",
      positive: false,
    },
  ] as const,
  disclaimer:
    "以上星级推介均属虚拟性质，只适用于 AASTOCKS 智财投资大赛平台。",
  footerUpdatedAt: "2021/04/21 22:00 HKT",
} as const;

export const starRankingList = [
  { rank: "2", name: "Mary Lee", gain: "+11.9%", followed: false },
  { rank: "3", name: "Wong Hiu Ming", gain: "+11.5%", followed: true },
  { rank: "4", name: "Jess Ngai", gain: "+10.8%", followed: false },
  { rank: "5", name: "Ronald Tong", gain: "+10.5%", followed: false },
  { rank: "6", name: "Raymond", gain: "+10.2%", followed: true },
] as const;

export const rankingList = [
  { rank: "1", name: "Mary Lee", amount: "HK$3,228,531", gain: "+11.6%" },
  { rank: "2", name: "Wong Hiu Ming", amount: "HK$3,125,211", gain: "+11.3%" },
  { rank: "3", name: "Jess Ngai", amount: "HK$3,112,899", gain: "+11.3%" },
  { rank: "4", name: "Ronald Tong", amount: "HK$3,035,986", gain: "+11.2%" },
  { rank: "5", name: "Raymond", amount: "HK$3,005,886", gain: "+11.0%" },
  { rank: "12", name: "Joey Cheung", amount: "HK$1,000,000", gain: "+12.0%", current: true },
 ] as const;

export const assistantResults = [
  { symbol: "腾讯控股", code: "0700", logo: "腾" },
  { symbol: "阿里巴巴-SW", code: "9988", logo: "阿" },
  { symbol: "香港交易所", code: "0388", logo: "港" },
  { symbol: "盈富基金", code: "2800", logo: "盈" },
] as const;

export const recentSearches = [
  { symbol: "0700", name: "腾讯控股" },
  { symbol: "9988", name: "阿里巴巴-SW" },
  { symbol: "0388", name: "香港交易所" },
  { symbol: "2800", name: "盈富基金" },
] as const;

export const homeEventStats = [
  { label: "累计参加人数", primary: "223,563", secondary: "", icon: "users" },
  { label: "共持有资产总值", primary: "HK$9,562亿", secondary: "", icon: "value" },
  {
    label: "赛事交易金额",
    primary: "今日 HK$1,105,153",
    secondary: "累计 HK$5,398亿",
    icon: "coin",
  },
  {
    label: "赛事交易次数",
    primary: "今日 151,586",
    secondary: "累计 2,358,456",
    icon: "repeat",
  },
] as const;

export const homeSummaryCard = {
  name: "Joey Cheung",
  rank: "91",
  rankRise: "12",
  dailyTrades: "每天可供交易次数",
  dailyTradesValue: "16次",
  requiredTrades: "每组需交易4次",
  requiredTradesValue: "2次",
  referenceValue: "513,910.000",
  cash: "379,562.100",
  totalAssets: "947,321.640",
  updatedAt: "2021/04/21 22:00 HKT",
} as const;

export const homeStarParticipants = {
  tabs: ["青姐", "沈大师", "英sir"] as const,
  featured: {
    name: "青姐",
    tag: "独立股评人",
    intro: "今日留意 0700 腾讯控股回调吸纳机会，并观察 9988 阿里巴巴-SW 成交量变化。",
    totalAssets: "1,656,735.000 港元",
    holding: "0700",
    recentTrade: "买入 9988",
  },
} as const;

export const homeHoldingCloud = [
  { rank: "第4名", symbol: "1810", value: "18", unit: "亿港元", size: 88, left: 8, top: 34 },
  { rank: "第2名", symbol: "9988", value: "21.6", unit: "亿港元", size: 102, left: 72, top: 88 },
  { rank: "第1名", symbol: "0700", value: "22.5", unit: "亿港元", size: 128, left: 142, top: 12 },
  { rank: "第3名", symbol: "3690", value: "19.1", unit: "亿港元", size: 110, left: 226, top: 92 },
  { rank: "第5名", symbol: "1211", value: "17.2", unit: "亿港元", size: 92, left: 286, top: 28 },
] as const;

export const homeVolumeSnapshot = {
  buy: {
    label: "最多参赛者买入",
    symbol: "0700",
    amountLabel: "总买入金额",
    amount: "20.2万 港元",
  },
  sell: {
    label: "最多参赛者卖出",
    symbol: "1211",
    amountLabel: "总卖出金额",
    amount: "18.1万 港元",
  },
} as const;

export const homeWeeklyFlyers = {
  tabs: ["第一名", "第二名", "第三名"] as const,
  featured: {
    name: "Kit Chu",
    tag: "第一名得奖者",
    period: "2026/04/25 至2026/04/29",
    gainLabel: "得奖纪录",
    gain: "+93%",
    riseLabel: "排名上升",
    rise: "10183",
  },
} as const;

export const homeRankingRows = [
  { rank: "1", movement: "flat", name: "Mary Lee", amount: "HK$3,228,531", gain: "+93%" },
  { rank: "2", movement: "up", name: "Wong Hiu Ming", amount: "HK$3,215,211", gain: "+93%" },
  { rank: "3", movement: "up", name: "Jess Ngai", amount: "HK$3,112,889", gain: "+93%" },
  { rank: "4", movement: "down", name: "Ronald Tong", amount: "HK$3,112,001", gain: "+93%" },
  { rank: "5", movement: "down", name: "Raymond", amount: "HK$3,005,886", gain: "+93%" },
  { rank: "91", movement: "up", name: "Joey Cheung", amount: "HK$947,321", gain: "+12%" },
] as const;

export const tradeProducts = {
  "0700": {
    symbol: "0700",
    company: "腾讯控股",
    sub: "HKEX",
    price: "300.000",
    change: "+2.800 (0.94%)",
    remainingTrades: "19",
    cashBalance: "HK$ 1,000,000.000",
    lotSize: "100",
    defaultPrice: "300.000",
    defaultQuantity: "100",
    settlementTotal: "HK$ 30,000.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "9988": {
    symbol: "9988",
    company: "阿里巴巴-SW",
    sub: "HKEX",
    price: "70.000",
    change: "-1.250 (1.75%)",
    remainingTrades: "19",
    cashBalance: "HK$ 947,321.400",
    lotSize: "100",
    defaultPrice: "70.000",
    defaultQuantity: "100",
    settlementTotal: "HK$ 7,000.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "3690": {
    symbol: "3690",
    company: "美团-W",
    sub: "HKEX",
    price: "128.600",
    change: "+2.400 (1.90%)",
    remainingTrades: "18",
    cashBalance: "HK$ 947,321.400",
    lotSize: "100",
    defaultPrice: "128.600",
    defaultQuantity: "100",
    settlementTotal: "HK$ 12,860.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "1810": {
    symbol: "1810",
    company: "小米集团-W",
    sub: "HKEX",
    price: "18.960",
    change: "+0.260 (1.39%)",
    remainingTrades: "18",
    cashBalance: "HK$ 947,321.400",
    lotSize: "200",
    defaultPrice: "18.960",
    defaultQuantity: "200",
    settlementTotal: "HK$ 3,792.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "1211": {
    symbol: "1211",
    company: "比亚迪股份",
    sub: "HKEX",
    price: "201.800",
    change: "+7.200 (3.70%)",
    remainingTrades: "18",
    cashBalance: "HK$ 947,321.400",
    lotSize: "100",
    defaultPrice: "201.800",
    defaultQuantity: "100",
    settlementTotal: "HK$ 20,180.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "0388": {
    symbol: "0388",
    company: "香港交易所",
    sub: "HKEX",
    price: "290.000",
    change: "+2.000 (0.69%)",
    remainingTrades: "18",
    cashBalance: "HK$ 947,321.400",
    lotSize: "100",
    defaultPrice: "290.000",
    defaultQuantity: "100",
    settlementTotal: "HK$ 29,000.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "2800": {
    symbol: "2800",
    company: "盈富基金",
    sub: "HKEX",
    price: "19.800",
    change: "+0.150 (0.76%)",
    remainingTrades: "19",
    cashBalance: "HK$ 1,000,000.000",
    lotSize: "500",
    defaultPrice: "19.800",
    defaultQuantity: "500",
    settlementTotal: "HK$ 9,900.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "0005": {
    symbol: "0005",
    company: "汇丰控股",
    sub: "HKEX",
    price: "62.300",
    change: "+0.850 (1.38%)",
    remainingTrades: "19",
    cashBalance: "HK$ 1,000,000.000",
    lotSize: "400",
    defaultPrice: "62.300",
    defaultQuantity: "400",
    settlementTotal: "HK$ 24,920.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "1299": {
    symbol: "1299",
    company: "友邦保险",
    sub: "HKEX",
    price: "58.600",
    change: "+0.300 (0.51%)",
    remainingTrades: "19",
    cashBalance: "HK$ 1,000,000.000",
    lotSize: "200",
    defaultPrice: "58.600",
    defaultQuantity: "200",
    settlementTotal: "HK$ 11,720.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
  "9618": {
    symbol: "9618",
    company: "京东集团-SW",
    sub: "HKEX",
    price: "109.200",
    change: "-1.000 (0.91%)",
    remainingTrades: "18",
    cashBalance: "HK$ 947,321.400",
    lotSize: "100",
    defaultPrice: "109.200",
    defaultQuantity: "100",
    settlementTotal: "HK$ 10,920.00",
    platformLink: "到AASTOCKS查看详尽报价 >",
  },
} as const;

export type TradeSymbol = keyof typeof tradeProducts;

export function getTradeProduct(symbol: string) {
  const raw = symbol.toUpperCase().replace(/\.HK$/, "");
  const normalized =
    raw.length === 5 && raw.startsWith("0") ? raw.slice(1) : raw;
  const upperSymbol = normalized as TradeSymbol;

  return (
    tradeProducts[upperSymbol] ?? {
      symbol: upperSymbol,
      company: `${upperSymbol} 模拟交易`,
      sub: "HKEX",
      price: "133.480",
      change: "-0.10 (0.075%)",
      remainingTrades: "19",
      cashBalance: "HK$ 1,000,000.000",
      lotSize: "10",
      defaultPrice: "133.480",
      defaultQuantity: "10",
      settlementTotal: "HK$ 1,335.80",
      platformLink: "到AASTOCKS查看详尽报价 >",
    }
  );
}
