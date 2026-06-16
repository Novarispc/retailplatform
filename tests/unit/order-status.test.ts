import { describe, it, expect } from "vitest";
import { canTransition, nextStatuses } from "@/server/services/order-status";

describe("order status transitions", () => {
  it("allows the happy path forward", () => {
    expect(canTransition("PENDING", "PAID")).toBe(true);
    expect(canTransition("PAID", "FULFILLED")).toBe(true);
    expect(canTransition("FULFILLED", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
  });

  it("forbids skipping or going backwards", () => {
    expect(canTransition("PENDING", "SHIPPED")).toBe(false);
    expect(canTransition("DELIVERED", "PAID")).toBe(false);
    expect(canTransition("PAID", "PENDING")).toBe(false);
  });

  it("allows refunds from paid-or-later, not from pending", () => {
    expect(canTransition("PAID", "REFUNDED")).toBe(true);
    expect(canTransition("DELIVERED", "REFUNDED")).toBe(true);
    expect(canTransition("PENDING", "REFUNDED")).toBe(false);
  });

  it("treats terminal states as dead ends", () => {
    expect(nextStatuses("CANCELLED")).toEqual([]);
    expect(nextStatuses("REFUNDED")).toEqual([]);
  });

  it("offers valid next options for pending", () => {
    expect(nextStatuses("PENDING")).toContain("PAID");
    expect(nextStatuses("PENDING")).toContain("CANCELLED");
  });
});
