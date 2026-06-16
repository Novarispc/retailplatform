import Redis from "ioredis";
import { logger } from "@/lib/logger";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

/** Returns a shared Redis client, or null if it can't connect (rate limiting degrades open). */
export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;
  try {
    const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      enableOfflineQueue: false,
    });
    client.on("error", (err) => logger.warn({ err: err.message }, "redis error"));
    globalForRedis.redis = client;
    return client;
  } catch (err) {
    logger.warn({ err }, "redis unavailable");
    globalForRedis.redis = null;
    return null;
  }
}
