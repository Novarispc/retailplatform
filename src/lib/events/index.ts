// Lightweight in-process typed domain-event emitter.
// M1: synchronous handlers. Swap for a queue (BullMQ) in M4 without changing emit sites.
import { logger } from "@/lib/logger";

export type DomainEvent =
  | { type: "OrderCreated"; orderId: string; tenantId: string }
  | { type: "PaymentReceived"; orderId: string; paymentId: string }
  | { type: "PaymentFailed"; orderId: string; reason: string }
  | { type: "OrderShipped"; orderId: string }
  | { type: "RefundProcessed"; orderId: string; amountMinor: number }
  | { type: "CustomerRegistered"; userId: string }
  | { type: "LowStock"; variantId: string; sku: string; productName: string; quantity: number; threshold: number };

type Handler = (e: DomainEvent) => void | Promise<void>;

const handlers = new Map<DomainEvent["type"], Handler[]>();

export function on<T extends DomainEvent["type"]>(
  type: T,
  handler: (e: Extract<DomainEvent, { type: T }>) => void | Promise<void>,
) {
  const list = handlers.get(type) ?? [];
  list.push(handler as Handler);
  handlers.set(type, list);
}

export async function emit(event: DomainEvent) {
  logger.info({ event: event.type, ...event }, "domain-event");
  const list = handlers.get(event.type) ?? [];
  for (const h of list) {
    try {
      await h(event);
    } catch (err) {
      logger.error({ err, event: event.type }, "event handler failed");
    }
  }
}
