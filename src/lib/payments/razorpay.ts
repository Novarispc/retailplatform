import crypto from "node:crypto";
import Razorpay from "razorpay";
import { isRazorpayLive } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  CreateOrderInput,
  PaymentProvider,
  ProviderOrder,
  WebhookVerifyInput,
} from "./types";

/**
 * Razorpay adapter. When keys are absent it runs in mock mode: it returns a
 * fake order id so the storefront flow is fully demoable without credentials.
 */
class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay";
  private client: Razorpay | null = null;

  isLive() {
    return isRazorpayLive();
  }

  private getClient() {
    if (!this.client) {
      this.client = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
    }
    return this.client;
  }

  async createOrder(input: CreateOrderInput): Promise<ProviderOrder> {
    if (!this.isLive()) {
      logger.warn("Razorpay mock mode (no keys) — returning fake order");
      return {
        providerOrderId: `order_mock_${Date.now()}`,
        amountMinor: input.amountMinor,
        currency: input.currency,
      };
    }
    const order = await this.getClient().orders.create({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });
    return {
      providerOrderId: order.id,
      amountMinor: Number(order.amount),
      currency: order.currency,
    };
  }

  verifyWebhook({ rawBody, signature }: WebhookVerifyInput): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }
}

export const razorpayProvider = new RazorpayProvider();
