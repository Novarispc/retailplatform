import { NextResponse } from "next/server";
import { z } from "zod";
import { isRazorpayLive } from "@/lib/env";
import { settlePayment } from "@/server/services/order";

const schema = z.object({ providerOrderId: z.string().min(1) });

/**
 * Dev/demo-only: settle a mock order when Razorpay keys are not configured.
 * Disabled (404) the moment real keys are present — real flow uses the webhook.
 */
export async function POST(req: Request) {
  if (isRazorpayLive()) {
    return NextResponse.json({ error: "Not available in live mode" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const result = await settlePayment({
    providerOrderId: parsed.data.providerOrderId,
    providerPaymentId: `pay_mock_${Date.now()}`,
  });
  return NextResponse.json({ ok: result.settled });
}
