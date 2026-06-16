import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import type { GiftCard } from "@prisma/client";

/** Fetch a usable gift card (active, positive balance, unexpired). */
export async function getValidGiftCard(code: string): Promise<GiftCard | null> {
  const tenant = await getActiveTenant();
  const gc = await prisma.giftCard.findUnique({
    where: { tenantId_code: { tenantId: tenant.id, code: code.trim().toUpperCase() } },
  });
  if (!gc || !gc.active || gc.balanceMinor <= 0) return null;
  if (gc.expiresAt && gc.expiresAt < new Date()) return null;
  return gc;
}

/** Amount a gift card can cover for a given payable total (it's tender, not a discount). */
export function redeemableAmount(balanceMinor: number, payableMinor: number): number {
  return Math.max(0, Math.min(balanceMinor, payableMinor));
}
