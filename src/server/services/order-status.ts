import type { OrderStatus } from "@prisma/client";

// Allowed forward transitions for an order's lifecycle (pure, testable).
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["FULFILLED", "CANCELLED", "REFUNDED"],
  FULFILLED: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from] ?? [];
}
