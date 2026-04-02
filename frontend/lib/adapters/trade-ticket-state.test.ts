import test from "node:test";
import assert from "node:assert/strict";

import {
  canAmendOrder,
  canCancelOrder,
  resolveOrderDetailActionState,
  resolveTradeTicketInitialState,
} from "./trade-ticket-state.ts";

test("pending and partial-filled orders remain actionable in detail mode", () => {
  assert.equal(canAmendOrder("PENDING"), true);
  assert.equal(canCancelOrder("PENDING"), true);
  assert.equal(canAmendOrder("PARTIAL_FILLED"), true);
  assert.equal(canCancelOrder("PARTIAL_FILLED"), true);
});

test("filled, canceled, and rejected orders are read-only in detail mode", () => {
  assert.equal(canAmendOrder("FILLED"), false);
  assert.equal(canCancelOrder("FILLED"), false);
  assert.equal(canAmendOrder("CANCELED"), false);
  assert.equal(canCancelOrder("CANCELED"), false);
  assert.equal(canAmendOrder("REJECTED"), false);
  assert.equal(canCancelOrder("REJECTED"), false);
});

test("trade ticket initial state follows explicit stage override first", () => {
  assert.deepEqual(resolveTradeTicketInitialState("trade", "confirm"), {
    showConfirm: true,
    showSuccess: false,
    showDetails: false,
  });

  assert.deepEqual(resolveTradeTicketInitialState("order", "ticket"), {
    showConfirm: false,
    showSuccess: false,
    showDetails: false,
  });

  assert.deepEqual(resolveTradeTicketInitialState("trade", "success"), {
    showConfirm: false,
    showSuccess: true,
    showDetails: false,
  });
});

test("trade ticket defaults to details for order variant and ticket for trade variant", () => {
  assert.deepEqual(resolveTradeTicketInitialState("trade"), {
    showConfirm: false,
    showSuccess: false,
    showDetails: false,
  });

  assert.deepEqual(resolveTradeTicketInitialState("order"), {
    showConfirm: false,
    showSuccess: false,
    showDetails: true,
  });
});

test("filled or canceled order details become read-only", () => {
  assert.deepEqual(resolveOrderDetailActionState("FILLED", "o_1"), {
    allowAmendOrder: false,
    allowCancelOrder: false,
    showReadOnlyClose: true,
  });

  assert.deepEqual(resolveOrderDetailActionState("CANCELED", "o_2"), {
    allowAmendOrder: false,
    allowCancelOrder: false,
    showReadOnlyClose: true,
  });
});

test("pending order details still expose amend and cancel actions", () => {
  assert.deepEqual(resolveOrderDetailActionState("PENDING", "o_3"), {
    allowAmendOrder: true,
    allowCancelOrder: true,
    showReadOnlyClose: false,
  });
});
