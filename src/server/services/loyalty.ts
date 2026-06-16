import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// 1 point per ₹10 spent (totalMinor is in paise).
export const POINTS_PER_MINOR = 1 / 1000;
export const REFERRER_BONUS = 500;
export const REFEREE_BONUS = 200;

export function pointsForOrder(totalMinor: number): number {
  return Math.floor(totalMinor * POINTS_PER_MINOR);
}

export async function ensureLoyaltyAccount(userId: string, tx: Prisma.TransactionClient = prisma) {
  return tx.loyaltyAccount.upsert({
    where: { userId },
    update: {},
    create: { userId, points: 0 },
  });
}

/** Award loyalty points for a paid order. Idempotent per order via the txn ref. */
export async function awardLoyaltyForOrder(
  tx: Prisma.TransactionClient,
  userId: string,
  orderId: string,
  totalMinor: number,
) {
  const points = pointsForOrder(totalMinor);
  if (points <= 0) return;

  const existing = await tx.loyaltyTransaction.findFirst({
    where: { refType: "Order", refId: orderId, type: "EARN" },
  });
  if (existing) return; // already awarded

  const account = await ensureLoyaltyAccount(userId, tx);
  await tx.loyaltyAccount.update({ where: { id: account.id }, data: { points: { increment: points } } });
  await tx.loyaltyTransaction.create({
    data: { accountId: account.id, type: "EARN", points, reason: "order purchase", refType: "Order", refId: orderId },
  });
}

/** On a referred user's first paid order, reward both parties. */
export async function rewardReferralOnFirstOrder(
  tx: Prisma.TransactionClient,
  userId: string,
  orderId: string,
) {
  const referral = await tx.referral.findUnique({ where: { refereeId: userId } });
  if (!referral || referral.status === "REWARDED") return;

  await tx.referral.update({
    where: { id: referral.id },
    data: { status: "REWARDED", rewardedAt: new Date() },
  });

  for (const [uid, bonus] of [
    [referral.referrerId, REFERRER_BONUS],
    [referral.refereeId, REFEREE_BONUS],
  ] as const) {
    const acct = await ensureLoyaltyAccount(uid, tx);
    await tx.loyaltyAccount.update({ where: { id: acct.id }, data: { points: { increment: bonus } } });
    await tx.loyaltyTransaction.create({
      data: { accountId: acct.id, type: "REFERRAL_BONUS", points: bonus, reason: "referral reward", refType: "Order", refId: orderId },
    });
  }
}

export async function getLoyalty(userId: string) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  return account;
}

/** Generate + persist a referral code for a user if they don't have one. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;
  const code = `NOVA-${userId.slice(-6).toUpperCase()}`;
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}
