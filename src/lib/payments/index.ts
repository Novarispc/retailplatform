import type { PaymentProvider } from "./types";
import { razorpayProvider } from "./razorpay";
import { stripeProvider } from "./stripe";

export type ProviderName = "razorpay" | "stripe";

/** Pure routing: INR → Razorpay (India), everything else → Stripe (EU/global). */
export function providerForCurrency(currency: string): ProviderName {
  return currency.toUpperCase() === "INR" ? "razorpay" : "stripe";
}

export function getProvider(name: ProviderName): PaymentProvider {
  return name === "stripe" ? stripeProvider : razorpayProvider;
}

/** Resolve the provider for a given currency. */
export function getPaymentProviderForCurrency(currency: string): PaymentProvider {
  return getProvider(providerForCurrency(currency));
}

/** Back-compat default (Razorpay / INR). Prefer the currency-aware resolver. */
export function getPaymentProvider(): PaymentProvider {
  return razorpayProvider;
}

export * from "./types";
