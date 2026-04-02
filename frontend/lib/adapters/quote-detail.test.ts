import test from "node:test";
import assert from "node:assert/strict";

import { buildQuoteDetailMockKline } from "./quote-detail.ts";

test("buildQuoteDetailMockKline returns deterministic candles for the same stock", () => {
  const first = buildQuoteDetailMockKline("00700", 382.6);
  const second = buildQuoteDetailMockKline("00700", 382.6);

  assert.deepEqual(second, first);
  assert.equal(first.length, 24);
});

test("buildQuoteDetailMockKline keeps candle values internally consistent", () => {
  const series = buildQuoteDetailMockKline("00005", 68.45);

  for (const candle of series) {
    assert.equal(candle.high >= candle.open, true);
    assert.equal(candle.high >= candle.close, true);
    assert.equal(candle.low <= candle.open, true);
    assert.equal(candle.low <= candle.close, true);
    assert.equal(candle.volume > 0, true);
  }
});
