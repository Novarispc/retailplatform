// Zod contracts shared between API routes, server actions and clients.
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  ref: z.string().max(32).optional().or(z.literal("")),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const addressSchema = z.object({
  fullName: z.string().min(1).max(120),
  line1: z.string().min(1).max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  postalCode: z.string().min(3).max(12),
  country: z.string().min(2).max(2).default("IN"),
  phone: z.string().min(6).max(20).optional().or(z.literal("")),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  address: addressSchema,
  items: z.array(cartLineSchema).min(1).max(50),
  couponCode: z.string().max(32).optional().or(z.literal("")),
  giftCardCode: z.string().max(32).optional().or(z.literal("")),
  currency: z.enum(["INR", "EUR", "SEK", "USD"]).optional().default("INR"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Admin (M2) ──
export const productUpsertSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().min(1).max(4000),
  priceMajor: z.coerce.number().min(0).max(10_000_000),
  categoryId: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(true),
  imageUrl: z.string().url().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  specsJson: z.string().optional().default("[]"),
});
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z0-9-]+$/, "Uppercase letters, numbers and dashes only"),
  type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0).max(10_000_000).default(0),
  minSpendMajor: z.coerce.number().min(0).default(0),
  maxRedemptions: z.coerce.number().int().min(0).optional(),
});
export type CouponCreateInput = z.infer<typeof couponCreateSchema>;

export const inventoryAdjustSchema = z.object({
  variantId: z.string().min(1),
  delta: z.coerce.number().int(),
  reason: z.string().max(200).optional(),
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "PAID",
    "FULFILLED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export const razorpayWebhookEventSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string().nullable().optional(),
          status: z.string().optional(),
        }),
      })
      .optional(),
    order: z
      .object({
        entity: z.object({
          id: z.string(),
          receipt: z.string().nullable().optional(),
        }),
      })
      .optional(),
  }),
});
