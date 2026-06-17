import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  body: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = clientIp(req.headers);
  const rl = await rateLimit(`review:${ip}`, 5, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

  const { productId, rating, title, body: reviewBody } = parsed.data;
  const tenant = await getActiveTenant();

  const product = await prisma.product.findFirst({ where: { id: productId, tenantId: tenant.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const existing = await prisma.review.findFirst({ where: { productId, userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "You already reviewed this product." }, { status: 409 });

  // Create the review and recompute the aggregate rating atomically so
  // concurrent reviews can't compute a stale average off each other.
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title: title || null,
        body: reviewBody || null,
      },
      include: { user: { select: { name: true } } },
    });
    const agg = await tx.review.aggregate({ where: { productId }, _avg: { rating: true } });
    await tx.product.update({ where: { id: productId }, data: { rating: agg._avg.rating ?? 0 } });
    return created;
  });

  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const review = await prisma.review.findFirst({ where: { productId, userId: session.user.id } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: review.id } });
    const agg = await tx.review.aggregate({ where: { productId }, _avg: { rating: true } });
    await tx.product.update({ where: { id: productId }, data: { rating: agg._avg.rating ?? 0 } });
  });

  return NextResponse.json({ ok: true });
}
