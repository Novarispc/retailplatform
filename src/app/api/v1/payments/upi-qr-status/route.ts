import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Polling endpoint: client checks every ~3s to know if QR payment landed.
// Looks up the payment by providerOrderId and returns its status.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerOrderId = searchParams.get("providerOrderId");

  if (!providerOrderId) {
    return NextResponse.json({ error: "Missing providerOrderId" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { providerOrderId },
    select: { status: true, order: { select: { number: true } } },
  });

  if (!payment) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    paid: payment.status === "CAPTURED",
    orderNumber: payment.order?.number ?? null,
  });
}
