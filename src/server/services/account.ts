import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { emit } from "@/lib/events";
import type { SignUpInput } from "@/lib/contracts";

export class RegistrationError extends Error {}

export async function registerUser(input: SignUpInput) {
  const tenant = await getActiveTenant();
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new RegistrationError("An account with this email already exists.");

  // Resolve referrer from a referral code (if provided + valid + not self).
  let referrer = null;
  if (input.ref) {
    referrer = await prisma.user.findUnique({ where: { referralCode: input.ref.trim().toUpperCase() } });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      tenant: { connect: { id: tenant.id } },
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER",
      ...(referrer ? { referredBy: { connect: { id: referrer.id } } } : {}),
    },
  });

  if (referrer) {
    await prisma.referral.create({
      data: { referrerId: referrer.id, refereeId: user.id, status: "PENDING" },
    });
  }

  await emit({ type: "CustomerRegistered", userId: user.id });
  return { id: user.id, email: user.email, name: user.name };
}

/** GDPR data portability — everything we hold about a user. */
export async function exportUserData(userId: string) {
  const [user, orders, addresses, loyalty, consents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, referralCode: true, createdAt: true },
    }),
    prisma.order.findMany({ where: { userId }, include: { items: true, payment: true } }),
    prisma.address.findMany({ where: { userId } }),
    prisma.loyaltyAccount.findUnique({ where: { userId }, include: { transactions: true } }),
    prisma.consentLog.findMany({ where: { userId } }),
  ]);
  return { exportedAt: new Date().toISOString(), user, orders, addresses, loyalty, consents };
}

/**
 * GDPR right-to-erasure. Orders are retained for legal/accounting reasons but
 * stripped of personal links; all PII (account, addresses, loyalty) is deleted.
 */
export async function deleteUserAccount(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({
      where: { userId },
      data: { userId: null, email: "deleted@redacted.invalid" },
    });
    await tx.address.deleteMany({ where: { userId } });
    await tx.loyaltyAccount.deleteMany({ where: { userId } });
    await tx.referral.deleteMany({ where: { OR: [{ referrerId: userId }, { refereeId: userId }] } });
    await tx.consentLog.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}
