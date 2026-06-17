import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { getPaymentProviderForCurrency, providerForCurrency } from "@/lib/payments";
import { emit } from "@/lib/events";
import { logger } from "@/lib/logger";
import { writeAudit } from "./audit";
import { computeTotals, effectiveUnitPrice, type PricedLine } from "./pricing";
import { getValidCoupon, toDiscountInput } from "./coupon";
import { getValidGiftCard, redeemableAmount } from "./giftcard";
import { fromINRMinor } from "@/lib/fx";
import { enqueue } from "@/lib/jobs";
import type { CurrencyCode } from "@/lib/money";
import type { CheckoutInput } from "@/lib/contracts";

export class CheckoutError extends Error {}

function orderNumber() {
  return `NOVA-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
}

export interface CheckoutResult {
  orderNumber: string;
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  keyId: string | null;
  clientSecret: string | null;
  isMock: boolean;
}

/**
 * Validate the cart server-side (never trust client prices), create a PENDING
 * order with a CREATED payment, reserve inventory, and open a provider order.
 */
export async function createCheckoutOrder(
  input: CheckoutInput,
  userId: string | null,
): Promise<CheckoutResult> {
  const tenant = await getActiveTenant();

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) } },
    include: { product: true, inventory: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: PricedLine[] = [];
  for (const item of input.items) {
    const v = byId.get(item.variantId);
    if (!v || v.product.tenantId !== tenant.id || !v.product.active) {
      throw new CheckoutError(`Item unavailable: ${item.variantId}`);
    }
    const available = (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0);
    if (available < item.quantity) {
      throw new CheckoutError(`Insufficient stock for ${v.product.name}`);
    }
    lines.push({
      variantId: v.id,
      name: `${v.product.name}${v.name && v.name !== "Standard" ? ` — ${v.name}` : ""}`,
      unitPriceMinor: effectiveUnitPrice(v.product.priceMinor, v.priceMinor),
      quantity: item.quantity,
    });
  }

  // Server-side coupon validation (never trust client-computed discounts).
  let coupon = null;
  if (input.couponCode) {
    coupon = await getValidCoupon(input.couponCode);
    if (!coupon) throw new CheckoutError("Coupon is invalid or expired.");
  }
  const totals = computeTotals(lines, coupon ? toDiscountInput(coupon) : null);
  if (coupon && totals.subtotalMinor < coupon.minSpendMinor) {
    throw new CheckoutError("Cart does not meet the coupon's minimum spend.");
  }
  // Gift card is tender (reduces the amount charged), validated server-side.
  let giftCard = null;
  let giftCardMinor = 0;
  if (input.giftCardCode) {
    giftCard = await getValidGiftCard(input.giftCardCode);
    if (!giftCard) throw new CheckoutError("Gift card is invalid or has no balance.");
    giftCardMinor = redeemableAmount(giftCard.balanceMinor, totals.totalMinor);
  }
  const payableMinor = totals.totalMinor - giftCardMinor;

  const number = orderNumber();
  const idempotencyKey = `chk_${number}`;
  const currency: CurrencyCode = (input.currency as CurrencyCode) ?? "INR";
  // For EU currencies, convert INR-stored prices to the target currency for the payment provider.
  const toProviderMinor = (paiseAmount: number) => fromINRMinor(paiseAmount, currency);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        tenant: { connect: { id: tenant.id } },
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        number,
        email: input.email,
        currency,
        subtotalMinor: totals.subtotalMinor,
        taxMinor: totals.taxMinor,
        shippingMinor: totals.shippingMinor,
        discountMinor: totals.discountMinor,
        couponCode: coupon?.code ?? null,
        giftCardMinor,
        giftCardCode: giftCard?.code ?? null,
        totalMinor: totals.totalMinor,
        shippingAddress: {
          create: {
            ...(userId ? { user: { connect: { id: userId } } } : {}),
            fullName: input.address.fullName,
            line1: input.address.line1,
            line2: input.address.line2 || null,
            city: input.address.city,
            state: input.address.state,
            postalCode: input.address.postalCode,
            country: input.address.country,
            phone: input.address.phone || null,
          },
        },
        items: {
          create: lines.map((l) => ({
            variantId: l.variantId,
            name: l.name,
            unitPriceMinor: l.unitPriceMinor,
            quantity: l.quantity,
          })),
        },
        payment: {
          create: {
            provider: providerForCurrency(currency),
            status: "CREATED",
            amountMinor: payableMinor,
            currency,
            idempotencyKey,
          },
        },
      },
    });

    // Reserve inventory inside the same transaction.
    for (const l of lines) {
      const v = byId.get(l.variantId)!;
      if (v.inventory) {
        await tx.inventory.update({
          where: { id: v.inventory.id },
          data: { reserved: { increment: l.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: v.inventory.id,
            type: "RESERVE",
            delta: -l.quantity,
            reason: "checkout reserve",
            refType: "Order",
            refId: created.id,
          },
        });
      }
    }

    // Count the coupon redemption atomically with the order.
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { timesRedeemed: { increment: 1 } },
      });
    }
    return created;
  });

  // Open provider order (mock or live), routed by currency.
  const provider = getPaymentProviderForCurrency(currency);
  const providerAmountMinor = toProviderMinor(payableMinor);
  const providerOrder = await provider.createOrder({
    amountMinor: providerAmountMinor,
    currency,
    receipt: number,
    notes: { orderNumber: number },
  });

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { providerOrderId: providerOrder.providerOrderId },
  });

  await emit({ type: "OrderCreated", orderId: order.id, tenantId: tenant.id });
  await writeAudit({
    actorId: userId,
    action: "order.created",
    entity: "Order",
    entityId: order.id,
    meta: { number, totalMinor: totals.totalMinor },
  });

  return {
    orderNumber: number,
    providerOrderId: providerOrder.providerOrderId,
    amountMinor: providerAmountMinor,
    currency,
    provider: provider.name,
    keyId:
      provider.name === "stripe"
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
        : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null,
    clientSecret: (providerOrder as { clientSecret?: string }).clientSecret ?? null,
    isMock: !provider.isLive(),
  };
}

/**
 * Idempotently settle a payment: mark CAPTURED + order PAID, convert reserved
 * stock to a sale. Safe to call multiple times (webhook retries, mock confirm).
 */
export async function settlePayment(input: {
  providerOrderId: string;
  providerPaymentId?: string | null;
  rawWebhook?: unknown;
}): Promise<{ settled: boolean; orderId?: string }> {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: input.providerOrderId },
    include: { order: { include: { items: { include: { variant: { include: { inventory: true } } } } } } },
  });
  if (!payment) {
    logger.warn({ providerOrderId: input.providerOrderId }, "settle: payment not found");
    return { settled: false };
  }
  if (payment.status === "CAPTURED") {
    return { settled: true, orderId: payment.orderId }; // idempotent no-op
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        providerPaymentId: input.providerPaymentId ?? undefined,
        rawWebhookJson: input.rawWebhook ? (input.rawWebhook as object) : undefined,
      },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });
    // Convert reservation to sale: decrement quantity + reserved.
    for (const item of payment.order.items) {
      const inv = item.variant?.inventory;
      if (!inv) continue;
      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type: "SALE",
          delta: -item.quantity,
          reason: "payment captured",
          refType: "Order",
          refId: payment.orderId,
        },
      });
    }

    // Decrement redeemed gift-card balance on settlement. Use a guarded atomic
    // decrement so two concurrent settlements can't both deduct the same balance
    // (TOCTOU). If the guard fails (balance changed under us), clamp to zero.
    if (payment.order.giftCardMinor > 0 && payment.order.giftCardCode) {
      const amount = payment.order.giftCardMinor;
      const code = payment.order.giftCardCode;
      const decremented = await tx.giftCard.updateMany({
        where: { code, balanceMinor: { gte: amount } },
        data: { balanceMinor: { decrement: amount } },
      });
      if (decremented.count === 0) {
        await tx.giftCard.updateMany({ where: { code }, data: { balanceMinor: 0 } });
      }
    }

  });

  // Loyalty + referral run post-transaction (idempotent; no need to block settlement).
  if (payment.order.userId) {
    await enqueue("award-loyalty", { userId: payment.order.userId, orderId: payment.orderId, totalMinor: payment.order.totalMinor });
    await enqueue("reward-referral", { userId: payment.order.userId, orderId: payment.orderId });
  }

  // Low-stock check: re-read updated inventory and emit per-variant alerts.
  for (const item of payment.order.items) {
    const inv = item.variant?.inventory;
    if (!inv) continue;
    const updated = await prisma.inventory.findUnique({ where: { id: inv.id } });
    if (!updated) continue;
    const available = updated.quantity - updated.reserved;
    if (available <= updated.lowStockThreshold) {
      await emit({
        type: "LowStock",
        variantId: item.variant.id,
        sku: item.variant.sku,
        productName: item.name,
        quantity: available,
        threshold: updated.lowStockThreshold,
      });
    }
  }

  await emit({ type: "PaymentReceived", orderId: payment.orderId, paymentId: payment.id });
  await writeAudit({
    action: "payment.captured",
    entity: "Order",
    entityId: payment.orderId,
    meta: { providerOrderId: input.providerOrderId, providerPaymentId: input.providerPaymentId },
  });
  return { settled: true, orderId: payment.orderId };
}

export async function getOrderByNumber(number: string, userId?: string | null) {
  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true, payment: true, shippingAddress: true },
  });
  if (!order) return null;
  // Owners (or guests who placed it) only; admins handled elsewhere.
  if (order.userId && userId && order.userId !== userId) return null;
  return order;
}

export async function listUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}
