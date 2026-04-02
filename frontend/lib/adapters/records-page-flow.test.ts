import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const recordsPagePath =
  "/Users/liuliu/Desktop/trading_game/frontend/app/records/page.tsx";

test("records history list opens read-only order detail via TradeTrigger", () => {
  const source = readFileSync(recordsPagePath, "utf8");

  assert.equal(
    source.includes("groupedRecords[date].map((item) => ("),
    true,
    "history section should still render grouped history rows"
  );
  assert.equal(
    source.includes("<TradeTrigger"),
    true,
    "records page should use TradeTrigger for order detail entry"
  );
  assert.equal(
    source.includes("orderDetail={item}"),
    true,
    "history/status entries should pass order detail snapshot into modal"
  );
});
