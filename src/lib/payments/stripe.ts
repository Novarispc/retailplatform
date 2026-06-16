import Stripe from "stripe";
import { isStripeLive } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  CreateOrderInput,
  PaymentProvider,
  ProviderOrder,
  WebhookVerifyInput,
} from "./types";

/**
 * Stripe adapter (EU/global markets — SEK/EUR/USD). Mirrors the Razorpay adapter
 * behind the same PaymentProvider interface. Mock mode returns a fake intent id
 * when no key is configured so the flow stays demoable.
 */
class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  private client: Stripe | null = null;

  isLive() {
    return isStripeLive();
  }

  private getClient() {
    if (!this.client) {
      this.client = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }
    return this.client;
  }

  async createOrder(input: CreateOrderInput): Promise<ProviderOrder> {
    if (!this.isLive()) {
      logger.warn("Stripe mock mode (no key) — returning fake PaymentIntent");
      return {
        providerOrderId: `pi_mock_${Date.now()}`,
        amountMinor: input.amountMinor,
        currency: input.currency,
      };
    }
    const intent = await this.getClient().paymentIntents.create({
      amount: input.amountMinor,
      currency: input.currency.toLowerCase(),
      metadata: { receipt: input.receipt, ...input.notes },
      automatic_payment_methods: { enabled: true },
    });
    return {
      providerOrderId: intent.id,
      amountMinor: intent.amount,
      currency: intent.currency.toUpperCase(),
      clientSecret: intent.client_secret ?? undefined,
    };
  }

  verifyWebhook({ rawBody, signature }: WebhookVerifyInput): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return false;
    try {
      this.getClient().webhooks.constructEvent(rawBody, signature, secret);
      return true;
    } catch {
      return false;
    }
  }
}

export const stripeProvider = new StripeProvider();
