import test from "node:test";
import assert from "node:assert/strict";

import { getRealtimeQuoteCopy } from "./realtime-quote-copy.ts";

test("getRealtimeQuoteCopy returns English labels for quote detail", () => {
  const copy = getRealtimeQuoteCopy("en");

  assert.equal(copy.back, "Back");
  assert.equal(copy.loading, "Loading realtime quote...");
  assert.equal(copy.loadErrorTitle, "Quote unavailable");
  assert.equal(copy.bidDepthTitle, "Bid");
  assert.equal(copy.askDepthTitle, "Ask");
  assert.equal(copy.connection.live, "Live");
});

test("getRealtimeQuoteCopy returns Simplified Chinese labels for quote detail", () => {
  const copy = getRealtimeQuoteCopy("zh-Hans");

  assert.equal(copy.back, "返回");
  assert.equal(copy.loading, "加载实时报价中...");
  assert.equal(copy.marketNoteTitle, "行情说明");
  assert.equal(copy.connection.connecting, "连接中");
  assert.equal(copy.emptyDepthTitle, "暂无盘口数据");
});
