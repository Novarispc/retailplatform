// PaymentProvider abstraction. Razorpay is the only live adapter (M1);
// Stripe/Klarna/etc. implement the same interface later with zero changes upstream.

export interface CreateOrderInput {
  amountMinor: number;
  currency: string;
  receipt: string; // our order number
  notes?: Record<string, string>;
}

export interface ProviderOrder {
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  clientSecret?: string;
}

export interface WebhookVerifyInput {
  rawBody: string;
  signature: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** Whether the provider has credentials configured. */
  isLive(): boolean;
  createOrder(input: CreateOrderInput): Promise<ProviderOrder>;
  /** Verify HMAC signature of an incoming webhook. */
  verifyWebhook(input: WebhookVerifyInput): boolean;
}
