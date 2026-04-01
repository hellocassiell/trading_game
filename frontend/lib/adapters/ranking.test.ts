import test from "node:test";
import assert from "node:assert/strict";

import { resolvePreferredStarTab } from "./star-tab.ts";

test("resolvePreferredStarTab chooses tab mapped by userId first", () => {
  const tab = resolvePreferredStarTab(
    ["第一名", "第二名", "第三名"],
    { u_1: "第二名" },
    "u_1",
    "",
    "第一名"
  );

  assert.equal(tab, "第二名");
});

test("resolvePreferredStarTab falls back to explicit tab then current tab", () => {
  const byTab = resolvePreferredStarTab(
    ["A", "B", "C"],
    {},
    "",
    "C",
    "A"
  );
  assert.equal(byTab, "C");

  const byCurrent = resolvePreferredStarTab(
    ["A", "B", "C"],
    {},
    "",
    "Z",
    "B"
  );
  assert.equal(byCurrent, "B");
});

test("resolvePreferredStarTab returns first tab or empty", () => {
  const first = resolvePreferredStarTab(["A", "B"], {}, "", "", "");
  assert.equal(first, "A");

  const empty = resolvePreferredStarTab([], {}, "", "", "A");
  assert.equal(empty, "");
});
