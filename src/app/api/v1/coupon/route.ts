import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidCoupon, toDiscountInput } from "@/server/services/coupon";
import { computeDiscount } from "@/server/services/pricing";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const schema = z.object({ code: z.string().min(1).max(32), subtotalMinor: z.number().int().min(0) });

export async function POST(req: Request) {
  const rl = await rateLimit(`coupon:${clientIp(req.headers)}`, 20, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const coupon = await getValidCoupon(parsed.data.code);
  if (!coupon) return NextResponse.json({ valid: false, error: "Invalid or expired code." }, { status: 200 });

  const d = toDiscountInput(coupon);
  const { discountMinor, freeShipping } = computeDiscount(parsed.data.subtotalMinor, d);
  if (parsed.data.subtotalMinor < coupon.minSpendMinor) {
    return NextResponse.json({
      valid: false,
      error: `Spend at least ₹${(coupon.minSpendMinor / 100).toFixed(0)} to use this code.`,
    });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountMinor,
    freeShipping,
  });
}
