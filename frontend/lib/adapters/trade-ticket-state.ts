import type { TradeOrderStatus } from "../api/types";

export type TradeTicketVariant = "trade" | "order";
export type TradeTicketStage = "ticket" | "detail" | "confirm" | "success";

export function canAmendOrder(status?: TradeOrderStatus) {
  return status === "PENDING" || status === "PARTIAL_FILLED";
}

export function canCancelOrder(status?: TradeOrderStatus) {
  return status === "PENDING" || status === "PARTIAL_FILLED";
}

export function resolveOrderDetailActionState(
  status: TradeOrderStatus | undefined,
  orderId?: string
) {
  const allowAmendOrder = !!orderId && canAmendOrder(status);
  const allowCancelOrder = !!orderId && canCancelOrder(status);

  return {
    allowAmendOrder,
    allowCancelOrder,
    showReadOnlyClose: !allowAmendOrder && !allowCancelOrder,
  };
}

export function resolveTradeTicketInitialState(
  variant: TradeTicketVariant,
  initialStage?: TradeTicketStage
) {
  if (initialStage === "confirm") {
    return { showConfirm: true, showSuccess: false, showDetails: false };
  }
  if (initialStage === "success") {
    return { showConfirm: false, showSuccess: true, showDetails: false };
  }
  if (initialStage === "detail") {
    return { showConfirm: false, showSuccess: false, showDetails: true };
  }
  if (initialStage === "ticket") {
    return { showConfirm: false, showSuccess: false, showDetails: false };
  }

  if (variant === "order") {
    return { showConfirm: false, showSuccess: false, showDetails: true };
  }

  return { showConfirm: false, showSuccess: false, showDetails: false };
}
