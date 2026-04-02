import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routeFiles = [
  "/Users/liuliu/Desktop/trading_game/frontend/app/trade/[symbol]/confirm/page.tsx",
  "/Users/liuliu/Desktop/trading_game/frontend/app/trade/[symbol]/edit/page.tsx",
  "/Users/liuliu/Desktop/trading_game/frontend/app/trade/[symbol]/success/page.tsx",
  "/Users/liuliu/Desktop/trading_game/frontend/app/trade/[symbol]/validity/page.tsx",
];

test("trade direct pages no longer depend on PrototypeStates previews", () => {
  for (const filePath of routeFiles) {
    const source = readFileSync(filePath, "utf8");
    assert.equal(source.includes("PrototypeStates"), false, `${filePath} still imports PrototypeStates`);
    assert.equal(source.includes("TradeTicketCard"), true, `${filePath} should render TradeTicketCard`);
  }
});
