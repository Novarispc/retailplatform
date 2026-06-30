import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { isRazorpayLive } from "@/lib/env";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  providerOrderId: z.string(),
  amountMinor: z.number().int().positive(),
  orderNumber: z.string(),
  storeName: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { providerOrderId, amountMinor, orderNumber, storeName } = parsed.data;

  if (!isRazorpayLive()) {
    // Mock: return a placeholder QR so the UI is demoable without credentials.
    return NextResponse.json({
      qrId: `qr_mock_${Date.now()}`,
      imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=demo@upi&pn=Demo&am=${(amountMinor / 100).toFixed(2)}&cu=INR&tn=${orderNumber}`)}`,
      closeBy: Math.floor(Date.now() / 1000) + 900,
      isMock: true,
    });
  }

  try {
    const client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const qr = await (client as unknown as {
      qrCode: {
        create: (opts: Record<string, unknown>) => Promise<{
          id: string;
          image_url: string;
          close_by: number;
        }>;
      };
    }).qrCode.create({
      type: "upi_qr",
      name: storeName ?? "ASPORTS ZONE",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amountMinor,
      description: `Order ${orderNumber}`,
      close_by: Math.floor(Date.now() / 1000) + 900,
      notes: { order_id: providerOrderId, order_number: orderNumber },
    });

    return NextResponse.json({
      qrId: qr.id,
      imageUrl: qr.image_url,
      closeBy: qr.close_by,
      isMock: false,
    });
  } catch (err) {
    logger.error({ err }, "upi-qr create failed");
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 });
  }
}
