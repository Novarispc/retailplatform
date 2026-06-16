// Pure pricing logic — no I/O, fully unit-testable.

export interface PricedLine {
  variantId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
}

export interface CartTotals {
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export type DiscountKind = "PERCENT" | "FIXED" | "FREE_SHIPPING";

export interface DiscountInput {
  type: DiscountKind;
  value: number; // percent (0-100) or fixed minor units
  minSpendMinor?: number;
}

// GST 18% (India). Free shipping over ₹5000, else ₹99 flat.
export const TAX_RATE = 0.18;
export const FREE_SHIPPING_THRESHOLD_MINOR = 500000;
export const FLAT_SHIPPING_MINOR = 9900;

/** Compute the discount amount + whether shipping is waived for a given subtotal. */
export function computeDiscount(
  subtotalMinor: number,
  discount?: DiscountInput | null,
): { discountMinor: number; freeShipping: boolean } {
  if (!discount) return { discountMinor: 0, freeShipping: false };
  if (subtotalMinor < (discount.minSpendMinor ?? 0)) {
    return { discountMinor: 0, freeShipping: false };
  }
  switch (discount.type) {
    case "PERCENT": {
      const pct = Math.max(0, Math.min(100, discount.value));
      return { discountMinor: Math.round((subtotalMinor * pct) / 100), freeShipping: false };
    }
    case "FIXED":
      return { discountMinor: Math.min(discount.value, subtotalMinor), freeShipping: false };
    case "FREE_SHIPPING":
      return { discountMinor: 0, freeShipping: true };
    default:
      return { discountMinor: 0, freeShipping: false };
  }
}

export function computeTotals(lines: PricedLine[], discount?: DiscountInput | null): CartTotals {
  const subtotalMinor = lines.reduce((sum, l) => sum + l.unitPriceMinor * l.quantity, 0);

  const { discountMinor, freeShipping } = computeDiscount(subtotalMinor, discount);
  const discountedSubtotal = Math.max(0, subtotalMinor - discountMinor);

  const taxMinor = Math.round(discountedSubtotal * TAX_RATE);
  const shippingMinor =
    discountedSubtotal === 0 || freeShipping || discountedSubtotal >= FREE_SHIPPING_THRESHOLD_MINOR
      ? 0
      : FLAT_SHIPPING_MINOR;
  const totalMinor = discountedSubtotal + taxMinor + shippingMinor;

  return { subtotalMinor, discountMinor, taxMinor, shippingMinor, totalMinor };
}

/** Effective unit price for a variant (variant override or product base). */
export function effectiveUnitPrice(
  productPriceMinor: number,
  variantPriceMinor: number | null | undefined,
): number {
  return variantPriceMinor ?? productPriceMinor;
}
