import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidGiftCard, redeemableAmount } from "@/server/services/giftcard";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const schema = z.object({ code: z.string().min(1).max(32), payableMinor: z.number().int().min(0) });

export async function POST(req: Request) {
  const rl = await rateLimit(`giftcard:${clientIp(req.headers)}`, 20, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Slow down." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const gc = await getValidGiftCard(parsed.data.code);
  if (!gc) return NextResponse.json({ valid: false, error: "Invalid or empty gift card." });

  return NextResponse.json({
    valid: true,
    code: gc.code,
    balanceMinor: gc.balanceMinor,
    redeemableMinor: redeemableAmount(gc.balanceMinor, parsed.data.payableMinor),
  });
}
