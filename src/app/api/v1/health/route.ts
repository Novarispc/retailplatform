import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Liveness/readiness probe for load balancers + uptime monitors.
export async function GET() {
  const checks: Record<string, "ok" | "down"> = { db: "down", redis: "down" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch {
    /* db down */
  }

  try {
    const redis = getRedis();
    if (redis && (await redis.ping()) === "PONG") checks.redis = "ok";
  } catch {
    /* redis down (non-critical — degrades open) */
  }

  // DB is the only hard dependency; Redis degrades gracefully (rate limiting).
  const healthy = checks.db === "ok";
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      checks,
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
