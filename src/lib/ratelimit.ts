// Fixed-window rate limiter backed by Redis, with an in-memory fallback so we
// never fail fully open when Redis is unavailable (DoS protection on auth,
// checkout, coupon, giftcard, review endpoints).
import { getRedis } from "@/lib/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

// Per-process in-memory fallback. Not shared across instances, but caps abuse
// from any single instance when Redis is down.
const memBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const bucket = memBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    memBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetSeconds: windowSeconds };
  }
  bucket.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), resetSeconds };
}

// Opportunistically sweep expired buckets to bound memory.
function sweepMemory(now: number) {
  if (memBuckets.size < 5000) return;
  for (const [k, v] of memBuckets) if (v.resetAt <= now) memBuckets.delete(k);
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    sweepMemory(Date.now());
    return memoryLimit(key, limit, windowSeconds);
  }

  const redisKey = `rl:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.expire(redisKey, windowSeconds);
    const ttl = await redis.ttl(redisKey);
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch {
    // Redis errored mid-flight — fall back to in-memory instead of failing open.
    sweepMemory(Date.now());
    return memoryLimit(key, limit, windowSeconds);
  }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
