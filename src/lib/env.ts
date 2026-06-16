// Centralized, validated env access. Fail fast on missing critical vars.
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),

  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),

  VAPID_PUBLIC_KEY: z.string().optional().default(""),
  VAPID_PRIVATE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional().default(""),
  VAPID_SUBJECT: z.string().optional().default("mailto:admin@nova.test"),

  S3_ENDPOINT: z.string().default("localhost"),
  S3_PORT: z.coerce.number().default(9000),
  S3_USE_SSL: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  S3_ACCESS_KEY: z.string().default("minioadmin"),
  S3_SECRET_KEY: z.string().default("minioadmin"),
  S3_BUCKET: z.string().default("retail-media"),
  S3_PUBLIC_URL: z.string().default("http://localhost:9000/retail-media"),

  SENTRY_DSN: z.string().optional().default(""),
  LOG_LEVEL: z.string().default("info"),
  DEFAULT_TENANT_SLUG: z.string().default("default"),
  NODE_ENV: z.string().default("development"),
});

// Parse lazily so client bundles don't choke on server-only vars.
let cached: z.infer<typeof schema> | null = null;

export function env() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Invalid environment configuration: " +
        JSON.stringify(parsed.error.flatten().fieldErrors),
    );
  }
  cached = parsed.data;
  return cached;
}

/** Razorpay is "live" only when both keys are present; else mock mode. */
export function isRazorpayLive() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

/** Stripe is "live" only when the secret key is present; else mock mode. */
export function isStripeLive() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
