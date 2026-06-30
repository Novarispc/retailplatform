import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { razorpayWebhookEventSchema } from "@/lib/contracts";
import { settlePayment } from "@/server/services/order";
import { logger } from "@/lib/logger";

// Razorpay sends raw JSON + an HMAC signature header. We must verify against
// the RAW body (not re-serialized) before trusting anything.
export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  const provider = getPaymentProvider();
  if (!provider.verifyWebhook({ rawBody, signature })) {
    logger.warn("razorpay webhook signature invalid");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = razorpayWebhookEventSchema.safeParse(event);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unexpected payload" }, { status: 400 });
  }

  const { event: name, payload } = parsed.data;

  // Only act on successful payment/order events; ignore others gracefully.
  if (name === "payment.captured" || name === "order.paid" || name === "qr_code.credited") {
    const providerOrderId =
      payload.payment?.entity.order_id ?? payload.order?.entity.id;
    const providerPaymentId = payload.payment?.entity.id ?? null;

    if (!providerOrderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const result = await settlePayment({
      providerOrderId,
      providerPaymentId,
      rawWebhook: parsed.data,
    });
    return NextResponse.json({ received: true, settled: result.settled });
  }

  return NextResponse.json({ received: true, ignored: name });
}
