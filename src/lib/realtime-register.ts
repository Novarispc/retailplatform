// Bridge domain events → SSE pub/sub. Registered once at boot.
import { on } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtime";

let registered = false;

export function registerRealtimeBridge() {
  if (registered) return;
  registered = true;

  on("OrderCreated", async (e) => {
    const order = await prisma.order.findUnique({
      where: { id: e.orderId },
      select: { number: true, totalMinor: true, email: true },
    });
    if (order) {
      publish("order.created", { number: order.number, totalMinor: order.totalMinor, email: order.email });
    }
  });

  on("PaymentReceived", async (e) => {
    const order = await prisma.order.findUnique({
      where: { id: e.orderId },
      select: { number: true, totalMinor: true },
    });
    if (order) publish("payment.received", { number: order.number, totalMinor: order.totalMinor });
  });
}
