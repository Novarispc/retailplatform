import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/contracts";
import { createCheckoutOrder, CheckoutError } from "@/server/services/order";
import { auth } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`checkout:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many checkout attempts." }, { status: 429 });
  }

  const session = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createCheckoutOrder(parsed.data, session?.user?.id ?? null);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    logger.error({ err }, "checkout failed");
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
