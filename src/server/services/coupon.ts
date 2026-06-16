import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import type { DiscountInput } from "./pricing";
import type { Coupon } from "@prisma/client";

/** Fetch a usable coupon by code (active, unexpired, under redemption cap). */
export async function getValidCoupon(code: string): Promise<Coupon | null> {
  const tenant = await getActiveTenant();
  const coupon = await prisma.coupon.findUnique({
    where: { tenantId_code: { tenantId: tenant.id, code: code.trim().toUpperCase() } },
  });
  if (!coupon || !coupon.active) return null;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  if (coupon.maxRedemptions != null && coupon.timesRedeemed >= coupon.maxRedemptions) return null;
  return coupon;
}

export function toDiscountInput(coupon: Coupon): DiscountInput {
  return { type: coupon.type, value: coupon.value, minSpendMinor: coupon.minSpendMinor };
}
