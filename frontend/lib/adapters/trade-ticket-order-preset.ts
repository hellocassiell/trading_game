import type { TradeOrderDetail } from "../api/types";

export type TradeTicketOrderPreset = {
  side: "buy" | "sell";
  price: number;
  quantity: number;
};

export function resolveTradeTicketOrderPreset(
  orderDetail?: Pick<TradeOrderDetail, "direction" | "price" | "quantity">
): TradeTicketOrderPreset | null {
  if (!orderDetail) {
    return null;
  }

  return {
    side: orderDetail.direction === "SELL" ? "sell" : "buy",
    price: Number(orderDetail.price ?? 0),
    quantity: Number(orderDetail.quantity ?? 0),
  };
}
