import { describe, it, expect } from "vitest";
import {
  computeTotals,
  effectiveUnitPrice,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD_MINOR,
  FLAT_SHIPPING_MINOR,
  type PricedLine,
} from "@/server/services/pricing";

const line = (price: number, qty: number): PricedLine => ({
  variantId: "v",
  name: "x",
  unitPriceMinor: price,
  quantity: qty,
});

describe("computeTotals", () => {
  it("returns zeros for empty cart", () => {
    expect(computeTotals([])).toEqual({
      subtotalMinor: 0,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor: 0,
    });
  });

  it("sums line items and applies 18% GST", () => {
    const t = computeTotals([line(100000, 2)]); // ₹2000
    expect(t.subtotalMinor).toBe(200000);
    expect(t.taxMinor).toBe(Math.round(200000 * TAX_RATE));
    expect(t.taxMinor).toBe(36000);
  });

  it("charges flat shipping below the free threshold", () => {
    const t = computeTotals([line(100000, 1)]); // ₹1000 < ₹5000
    expect(t.shippingMinor).toBe(FLAT_SHIPPING_MINOR);
  });

  it("gives free shipping at/above the threshold", () => {
    const t = computeTotals([line(FREE_SHIPPING_THRESHOLD_MINOR, 1)]);
    expect(t.shippingMinor).toBe(0);
  });

  it("total = subtotal + tax + shipping", () => {
    const t = computeTotals([line(120000, 3)]);
    expect(t.totalMinor).toBe(t.subtotalMinor + t.taxMinor + t.shippingMinor);
  });
});

describe("effectiveUnitPrice", () => {
  it("prefers the variant override when present", () => {
    expect(effectiveUnitPrice(100000, 90000)).toBe(90000);
  });
  it("falls back to product base price", () => {
    expect(effectiveUnitPrice(100000, null)).toBe(100000);
    expect(effectiveUnitPrice(100000, undefined)).toBe(100000);
  });
});
