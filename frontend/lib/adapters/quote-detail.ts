export type QuoteDetailMockCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type QuoteDetailOrderBookEntry = {
  price: number;
  quantity: number;
};

export type QuoteDetailOrderBook = {
  bids: QuoteDetailOrderBookEntry[];
  asks: QuoteDetailOrderBookEntry[];
};

function roundPrice(value: number) {
  return Number(value.toFixed(3));
}

function getSeed(input: string) {
  return Array.from(input).reduce((seed, char) => seed + char.charCodeAt(0), 0);
}

function getTickSize(price: number) {
  if (price >= 200) {
    return 0.2;
  }
  if (price >= 100) {
    return 0.1;
  }
  if (price >= 20) {
    return 0.05;
  }
  if (price >= 10) {
    return 0.02;
  }
  return 0.01;
}

function getWave(seed: number, index: number, scale: number) {
  return Math.sin((seed + index * 13) / 7) * scale + Math.cos((seed + index * 5) / 11) * scale * 0.6;
}

export function buildQuoteDetailMockKline(
  stockCode: string,
  currentPrice: number
): QuoteDetailMockCandle[] {
  const seed = getSeed(stockCode);
  const candles: QuoteDetailMockCandle[] = [];
  const safeCurrentPrice = currentPrice > 0 ? currentPrice : 1;
  const tickSize = getTickSize(safeCurrentPrice);
  let previousClose = safeCurrentPrice * (0.94 + (seed % 5) * 0.008);

  for (let index = 0; index < 24; index += 1) {
    const drift = ((safeCurrentPrice - previousClose) / Math.max(1, 24 - index)) * 0.52;
    const open = previousClose + getWave(seed, index, tickSize * 4.2);
    const close = open + drift + getWave(seed + 17, index, tickSize * 3.4);
    const high = Math.max(open, close) + Math.abs(getWave(seed + 29, index, tickSize * 2.3));
    const low = Math.min(open, close) - Math.abs(getWave(seed + 43, index, tickSize * 2.1));
    const volumeBase = 2_800_000 + (seed % 9) * 260_000;
    const volume =
      Math.round(volumeBase + Math.abs(getWave(seed + 61, index, volumeBase * 0.24)));

    candles.push({
      time: `04-${String(index + 1).padStart(2, "0")}`,
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(Math.max(low, tickSize)),
      close: roundPrice(close),
      volume,
    });

    previousClose = close;
  }

  return candles;
}

export function buildQuoteDetailMockOrderBook(
  stockCode: string,
  currentPrice: number
): QuoteDetailOrderBook {
  const seed = getSeed(stockCode);
  const safeCurrentPrice = currentPrice > 0 ? currentPrice : 1;
  const tickSize = getTickSize(safeCurrentPrice);

  const bids = Array.from({ length: 5 }, (_, index) => ({
    price: roundPrice(safeCurrentPrice - tickSize * (index + 1)),
    quantity: 7_000 + ((seed + index * 37) % 11) * 1_300,
  }));

  const asks = Array.from({ length: 5 }, (_, index) => ({
    price: roundPrice(safeCurrentPrice + tickSize * (index + 1)),
    quantity: 6_400 + ((seed + index * 29) % 13) * 1_180,
  }));

  return { bids, asks };
}
