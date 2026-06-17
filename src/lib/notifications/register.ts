// Wire domain events → async jobs (BullMQ). Imported once at startup (instrumentation).
import { on } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { enqueue } from "@/lib/jobs";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { getStoreProfile } from "@/server/services/store";

let registered = false;

export function registerNotificationHandlers() {
  if (registered) return;
  registered = true;

  on("OrderCreated", async (e) => {
    const order = await prisma.order.findUnique({ where: { id: e.orderId } });
    if (!order) return;
    await enqueue("send-notification", {
      channel: "email",
      to: order.email,
      subject: `Order ${order.number} received`,
      body: `We've received your order ${order.number} for ${formatMoney(order.totalMinor, order.currency as CurrencyCode)}.`,
    });
  });

  on("PaymentReceived", async (e) => {
    const order = await prisma.order.findUnique({ where: { id: e.orderId } });
    if (!order) return;
    await enqueue("send-notification", {
      channel: "email",
      to: order.email,
      subject: `Payment confirmed — ${order.number}`,
      body: `Payment received for ${order.number}. Your order is being prepared.`,
    });
    await enqueue("send-push", {
      title: "Order confirmed!",
      body: `${order.number} — ${formatMoney(order.totalMinor, order.currency as CurrencyCode)} — we're preparing your order.`,
      url: `/order/${order.number}`,
    });
  });

  on("CustomerRegistered", async (e) => {
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: e.userId } }),
      getStoreProfile().catch(() => ({})),
    ]);
    if (!user) return;
    const storeName = (profile as { storeName?: string }).storeName ?? "ASPORTS ZONE";
    await enqueue("send-notification", {
      channel: "email",
      to: user.email,
      subject: `Welcome to ${storeName}`,
      body: `Welcome${user.name ? `, ${user.name}` : ""}! Use code WELCOME10 for 10% off your first order at ${storeName} — where the trust builds.`,
    });
  });

  on("OrderShipped", async (e) => {
    const order = await prisma.order.findUnique({ where: { id: e.orderId } });
    if (!order) return;
    await enqueue("send-notification", {
      channel: "email",
      to: order.email,
      subject: `${order.number} shipped`,
      body: `Your order ${order.number} is on its way!`,
    });
  });

  on("RefundProcessed", async (e) => {
    const order = await prisma.order.findUnique({ where: { id: e.orderId } });
    if (!order) return;
    await enqueue("send-notification", {
      channel: "email",
      to: order.email,
      subject: `Refund processed — ${order.number}`,
      body: `A refund of ${formatMoney(e.amountMinor, order.currency as CurrencyCode)} has been processed for ${order.number}.`,
    });
  });

  on("LowStock", async (e) => {
    // Notify all admin users via email + push.
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await enqueue("send-notification", {
        channel: "email",
        to: admin.email,
        subject: `Low stock alert — ${e.productName}`,
        body: `SKU ${e.sku} (${e.productName}) has ${e.quantity} unit${e.quantity === 1 ? "" : "s"} available (threshold: ${e.threshold}). Restock soon.`,
      });
    }
    await enqueue("send-push", {
      title: "Low stock alert",
      body: `${e.productName} — only ${e.quantity} left (SKU: ${e.sku})`,
      url: `/admin/products`,
    });
  });
}
