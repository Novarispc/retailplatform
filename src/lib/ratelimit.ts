// Fixed-window rate limiter backed by Redis. Degrades open if Redis is down.
import { getRedis } from "@/lib/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: limit, resetSeconds: windowSeconds };

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
    return { allowed: true, remaining: limit, resetSeconds: windowSeconds };
  }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
