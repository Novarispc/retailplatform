// Feature flags: DB-backed with env fallback. Cached per request lifetime.
import { prisma } from "@/lib/prisma";

export type FlagKey =
  | "ai_assistant"
  | "ai_search"
  | "referrals"
  | "loyalty"
  | "reviews";

const ENV_DEFAULTS: Record<FlagKey, boolean> = {
  ai_assistant: false,
  ai_search: false,
  referrals: false,
  loyalty: false,
  reviews: true,
};

export async function isEnabled(key: FlagKey): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (flag) return flag.enabled;
  } catch {
    // DB unavailable — fall back to env default
  }
  return ENV_DEFAULTS[key];
}
