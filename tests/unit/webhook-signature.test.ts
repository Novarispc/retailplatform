import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";

// Verify the Razorpay HMAC-SHA256 signature scheme used by the webhook route.
const SECRET = "test-webhook-secret";

beforeAll(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
});

function sign(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("razorpay webhook signature", () => {
  it("accepts a correctly signed body", async () => {
    const { razorpayProvider } = await import("@/lib/payments/razorpay");
    const body = JSON.stringify({ event: "payment.captured" });
    const signature = sign(body, SECRET);
    expect(razorpayProvider.verifyWebhook({ rawBody: body, signature })).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const { razorpayProvider } = await import("@/lib/payments/razorpay");
    const body = JSON.stringify({ event: "payment.captured" });
    const signature = sign(body, SECRET);
    const tampered = JSON.stringify({ event: "payment.failed" });
    expect(razorpayProvider.verifyWebhook({ rawBody: tampered, signature })).toBe(false);
  });

  it("rejects a wrong-secret signature", async () => {
    const { razorpayProvider } = await import("@/lib/payments/razorpay");
    const body = JSON.stringify({ event: "order.paid" });
    const signature = sign(body, "wrong-secret");
    expect(razorpayProvider.verifyWebhook({ rawBody: body, signature })).toBe(false);
  });
});
