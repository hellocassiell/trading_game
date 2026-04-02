import test from "node:test";
import assert from "node:assert/strict";

import { resolveTradeTicketOrderPreset } from "./trade-ticket-order-preset.ts";

test("resolveTradeTicketOrderPreset keeps sell order side, price, and quantity", () => {
  assert.deepEqual(
    resolveTradeTicketOrderPreset({
      direction: "SELL",
      price: 388.4,
      quantity: 2000,
    }),
    {
      side: "sell",
      price: 388.4,
      quantity: 2000,
    }
  );
});

test("resolveTradeTicketOrderPreset defaults buy orders correctly", () => {
  assert.deepEqual(
    resolveTradeTicketOrderPreset({
      direction: "BUY",
      price: 52.15,
      quantity: 500,
    }),
    {
      side: "buy",
      price: 52.15,
      quantity: 500,
    }
  );
});

test("resolveTradeTicketOrderPreset returns null without order detail", () => {
  assert.equal(resolveTradeTicketOrderPreset(undefined), null);
});
