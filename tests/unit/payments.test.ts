import { describe, it, expect } from "vitest";
import { providerForCurrency, getProvider, getPaymentProviderForCurrency } from "@/lib/payments";

describe("payment provider routing", () => {
  it("routes INR to Razorpay (India)", () => {
    expect(providerForCurrency("INR")).toBe("razorpay");
    expect(getPaymentProviderForCurrency("INR").name).toBe("razorpay");
  });

  it("routes EU/global currencies to Stripe", () => {
    for (const c of ["EUR", "SEK", "USD", "GBP"]) {
      expect(providerForCurrency(c)).toBe("stripe");
      expect(getPaymentProviderForCurrency(c).name).toBe("stripe");
    }
  });

  it("is case-insensitive", () => {
    expect(providerForCurrency("inr")).toBe("razorpay");
    expect(providerForCurrency("eur")).toBe("stripe");
  });

  it("getProvider returns the named adapter", () => {
    expect(getProvider("razorpay").name).toBe("razorpay");
    expect(getProvider("stripe").name).toBe("stripe");
  });
});

describe("stripe webhook verification", () => {
  it("rejects an unsigned/garbage payload", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    const { stripeProvider } = await import("@/lib/payments/stripe");
    expect(stripeProvider.verifyWebhook({ rawBody: "{}", signature: "bad" })).toBe(false);
  });
});
