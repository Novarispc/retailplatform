import { NextResponse } from "next/server";
import { getProvider } from "@/lib/payments";
import { settlePayment } from "@/server/services/order";
import { logger } from "@/lib/logger";

// Stripe sends raw JSON + a Stripe-Signature header. Verify against the raw body.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  const provider = getProvider("stripe");
  if (!provider.verifyWebhook({ rawBody, signature })) {
    logger.warn("stripe webhook signature invalid");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: { id?: string; payment_intent?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Settle on a successful PaymentIntent. providerOrderId == the intent id.
  if (event.type === "payment_intent.succeeded") {
    const intentId = event.data?.object?.id;
    if (!intentId) return NextResponse.json({ error: "Missing intent id" }, { status: 400 });
    const result = await settlePayment({
      providerOrderId: intentId,
      providerPaymentId: intentId,
      rawWebhook: event,
    });
    return NextResponse.json({ received: true, settled: result.settled });
  }

  return NextResponse.json({ received: true, ignored: event.type });
}
