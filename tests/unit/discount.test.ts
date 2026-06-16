import { describe, it, expect } from "vitest";
import { computeDiscount, computeTotals, type PricedLine } from "@/server/services/pricing";
import { pointsForOrder } from "@/server/services/loyalty";

const line = (price: number, qty: number): PricedLine => ({ variantId: "v", name: "x", unitPriceMinor: price, quantity: qty });

describe("computeDiscount", () => {
  it("applies percent off", () => {
    expect(computeDiscount(200000, { type: "PERCENT", value: 10 }).discountMinor).toBe(20000);
  });
  it("caps fixed discount at subtotal", () => {
    expect(computeDiscount(5000, { type: "FIXED", value: 50000 }).discountMinor).toBe(5000);
  });
  it("free shipping flags shipping, no amount discount", () => {
    const d = computeDiscount(100000, { type: "FREE_SHIPPING", value: 0 });
    expect(d.discountMinor).toBe(0);
    expect(d.freeShipping).toBe(true);
  });
  it("respects minimum spend", () => {
    expect(computeDiscount(100000, { type: "FIXED", value: 50000, minSpendMinor: 200000 }).discountMinor).toBe(0);
  });
});

describe("computeTotals with discount", () => {
  it("taxes the discounted subtotal", () => {
    const t = computeTotals([line(100000, 2)], { type: "PERCENT", value: 10 }); // ₹2000 → ₹1800
    expect(t.discountMinor).toBe(20000);
    expect(t.taxMinor).toBe(Math.round(180000 * 0.18));
    expect(t.totalMinor).toBe(180000 + t.taxMinor + t.shippingMinor);
  });
  it("free-shipping coupon waives shipping below threshold", () => {
    const t = computeTotals([line(100000, 1)], { type: "FREE_SHIPPING", value: 0 });
    expect(t.shippingMinor).toBe(0);
  });
  it("no discount behaves like before", () => {
    const t = computeTotals([line(120000, 3)]);
    expect(t.discountMinor).toBe(0);
    expect(t.totalMinor).toBe(t.subtotalMinor + t.taxMinor + t.shippingMinor);
  });
});

describe("loyalty points", () => {
  it("awards 1 point per ₹10", () => {
    expect(pointsForOrder(100000)).toBe(100); // ₹1000 → 100 pts
    expect(pointsForOrder(2999900)).toBe(2999);
  });
  it("floors fractional points", () => {
    expect(pointsForOrder(50)).toBe(0); // ₹0.50
  });
});
