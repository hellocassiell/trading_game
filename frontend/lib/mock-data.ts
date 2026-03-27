export const appMeta = {
  brand: "AASTOCKS",
  competition: "智财模拟美股投资大赛2020",
};

export const profile = {
  name: "Josey Cheung",
  ranking: "第 16 位",
  description: "Placeholder Placeholder Placeholder Placeholder",
  totalAssetsUsd: "513,910.00",
  totalAssetsHkd: "397,562.00",
  portfolioUsd: "947,321.40",
};

export const portfolioSummary = [
  { label: "参赛编号", value: "16 左右" },
  { label: "持仓次数", value: "2 次" },
  { label: "投资本金", value: "1,000,000.00 美元" },
  { label: "账户盈余", value: "513,960.00 美元" },
];

export const homeStats = [
  { label: "最新排名", value: "235,563", unit: "全球参赛者" },
  { label: "內含资金", value: "9,562", unit: "美元" },
  { label: "总资产值", value: "1,255,486", unit: "美元" },
];

export const summaryStats = [
  { label: "总市值", value: "$1,053,153", sub: "55,938 港元" },
  { label: "持有现金", value: "$1,255,486", sub: "72,356 港元" },
];

export const positions = [
  {
    symbol: "AAPL",
    name: "苹果",
    price: "133.480",
    qty: "1,000",
    pnl: "+5,206.90(4%)",
    change: "+0.75%",
    cost: "80,550",
    positive: true,
  },
  {
    symbol: "FB",
    name: "Meta",
    price: "80.550",
    qty: "2,000",
    pnl: "-5,200.90(4%)",
    change: "-0.75%",
    cost: "80,550",
    positive: false,
  },
];

export const holdings = [
  {
    symbol: "AAPL",
    name: "苹果",
    price: "133.480",
    qty: "1,000",
    action: "买入",
    cost: "63",
  },
  {
    symbol: "FB",
    name: "Meta",
    price: "40.400",
    qty: "800",
    action: "买入",
    cost: "52",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    price: "47.000",
    qty: "100",
    action: "买入",
    cost: "60",
  },
  {
    symbol: "CHKP",
    name: "Check Point",
    price: "40.400",
    qty: "800",
    action: "买入",
    cost: "52",
  },
  {
    symbol: "AEP",
    name: "美国电力",
    price: "57.400",
    qty: "500",
    action: "买入",
    cost: "60",
  },
];

export const records = [
  {
    symbol: "FB",
    name: "Meta",
    side: "买入",
    price: "40.400",
    qty: "800",
    amount: "32,320",
    date: "2021/05/04 12:00 HKT",
  },
  {
    symbol: "AAPL",
    name: "苹果",
    side: "买入",
    price: "133.480",
    qty: "500",
    amount: "66,740",
    date: "2021/05/04 12:00 HKT",
  },
  {
    symbol: "AAPL",
    name: "苹果",
    side: "卖出",
    price: "133.480",
    qty: "500",
    amount: "66,740",
    date: "2021/05/04 12:00 HKT",
  },
];

export const topVolume = [
  { symbol: "AAPL", name: "苹果", price: "20.2 美元", delta: "▲" },
  { symbol: "MSFT", name: "微软", price: "19.9 美元", delta: "▲" },
  { symbol: "AMZN", name: "亚马逊", price: "19.6 美元", delta: "▲" },
  { symbol: "GOOG", name: "Alphabet", price: "19.3 美元", delta: "▲" },
  { symbol: "GOOGL", name: "Alphabet", price: "19.2 美元", delta: "▲" },
  { symbol: "FB", name: "Facebook", price: "18.7 美元", delta: "▼" },
  { symbol: "TSLA", name: "特斯拉", price: "18.4 美元", delta: "▲" },
  { symbol: "NVDA", name: "英伟达", price: "18.1 美元", delta: "▲" },
  { symbol: "PYPL", name: "PayPal", price: "17.8 美元", delta: "▼" },
  { symbol: "CHKP", name: "Check Point", price: "5.5 美元", delta: "▲" },
];

export const loserHoldings = [
  { symbol: "AAPL", name: "苹果", loss: "22.5 美元", delta: "▼" },
  { symbol: "MSFT", name: "微软", loss: "21.8 美元", delta: "▼" },
  { symbol: "AMZN", name: "亚马逊", loss: "21.1 美元", delta: "▼" },
  { symbol: "GOOG", name: "Alphabet", loss: "20.4 美元", delta: "▼" },
  { symbol: "GOOGL", name: "Alphabet", loss: "19.7 美元", delta: "▼" },
  { symbol: "FB", name: "Facebook", loss: "19.3 美元", delta: "▼" },
  { symbol: "TSLA", name: "特斯拉", loss: "18.6 美元", delta: "▼" },
  { symbol: "NVDA", name: "英伟达", loss: "17.6 美元", delta: "▼" },
  { symbol: "PYPL", name: "PayPal", loss: "16.9 美元", delta: "▼" },
  { symbol: "CHKP", name: "Check Point", loss: "16.2 美元", delta: "▼" },
  { symbol: "INTC", name: "英特尔", loss: "15.5 美元", delta: "▼" },
  { symbol: "AEP", name: "美国电力", loss: "14.8 美元", delta: "▼" },
  { symbol: "ADBE", name: "Adobe", loss: "12.9 美元", delta: "▼" },
];

export const topHoldings = [
  { symbol: "AAPL", name: "苹果", value: "22.5 亿美元", delta: "▲" },
  { symbol: "MSFT", name: "微软", value: "21.8 亿美元", delta: "▲" },
  { symbol: "AMZN", name: "亚马逊", value: "21.1 亿美元", delta: "▲" },
  { symbol: "GOOG", name: "Alphabet", value: "20.4 亿美元", delta: "▼" },
  { symbol: "GOOGL", name: "Alphabet", value: "19.7 亿美元", delta: "▼" },
  { symbol: "FB", name: "Facebook", value: "19.3 亿美元", delta: "▼" },
  { symbol: "TSLA", name: "特斯拉", value: "18.3 亿美元", delta: "▲" },
  { symbol: "NVDA", name: "英伟达", value: "17.6 亿美元", delta: "▲" },
  { symbol: "PYPL", name: "PayPal", value: "16.9 亿美元", delta: "▲" },
  { symbol: "CHKP", name: "Check Point", value: "16.2 亿美元", delta: "▲" },
  { symbol: "INTC", name: "英特尔", value: "15.5 亿美元", delta: "▼" },
  { symbol: "AEP", name: "美国电力", value: "14.8 亿美元", delta: "▼" },
  { symbol: "ADBE", name: "Adobe", value: "12.9 亿美元", delta: "▼" },
];

export const strongestUsers = [
  { symbol: "FB", pct: "17" },
  { symbol: "AAPL", pct: "17" },
  { symbol: "CHKP", pct: "21" },
  { symbol: "APP", pct: "12" },
  { symbol: "GOOGL", pct: "7" },
];

export const rankingList = [
  { rank: "1", name: "Mary Lee", amount: "$3,228,531", gain: "+11.6%" },
  { rank: "2", name: "Wong Hiu Ming", amount: "$3,125,211", gain: "+11.3%" },
  { rank: "3", name: "Jess Ngai", amount: "$3,112,899", gain: "+11.3%" },
  { rank: "4", name: "Ronald Tong", amount: "$3,035,986", gain: "+11.2%" },
  { rank: "5", name: "Raymond", amount: "$3,005,886", gain: "+11.0%" },
  { rank: "91", name: "Josey Cheung", amount: "$947,321", gain: "+12%", current: true },
];

export const assistantResults = [
  { symbol: "苹果", code: "AAPL" },
  { symbol: "微软", code: "MSFT" },
  { symbol: "亚马逊", code: "AMZN" },
  { symbol: "Alphabet", code: "GOOG" },
  { symbol: "Alphabet", code: "GOOGL" },
  { symbol: "Facebook", code: "FB" },
  { symbol: "特斯拉", code: "TSLA" },
  { symbol: "英伟达", code: "NVDA" },
];

export const tradeProducts = {
  AAPL: {
    symbol: "AAPL",
    company: "Apple 苹果",
    sub: "#USSTOCKS",
    price: "133.480",
    change: "-0.10 (0.075%)",
    holdingValue: "1,912,735.00",
    side: "买入",
    cash: "1,335,800",
    quantity: "10",
  },
  CHKP: {
    symbol: "CHKP",
    company: "Check Point Software Technologies Ltd",
    sub: "#USSTOCKS",
    price: "133.480",
    change: "-0.10 (0.075%)",
    holdingValue: "1,912,735.00",
    side: "买入",
    cash: "1,335,800",
    quantity: "10",
  },
} as const;

export type TradeSymbol = keyof typeof tradeProducts;

export function getTradeProduct(symbol: string) {
  const upperSymbol = symbol.toUpperCase() as TradeSymbol;

  return (
    tradeProducts[upperSymbol] ?? {
      symbol: upperSymbol,
      company: `${upperSymbol} 模拟交易`,
      sub: "#USSTOCKS",
      price: "133.480",
      change: "-0.10 (0.075%)",
      holdingValue: "1,912,735.00",
      side: "买入",
      cash: "1,335,800",
      quantity: "10",
    }
  );
}
