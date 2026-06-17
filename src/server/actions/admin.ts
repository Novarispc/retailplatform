"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { getStorage } from "@/lib/storage";
import {
  productUpsertSchema,
  inventoryAdjustSchema,
  orderStatusUpdateSchema,
  couponCreateSchema,
} from "@/lib/contracts";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  adjustInventory,
  updateOrderStatus,
  createCoupon,
  toggleCoupon,
  createGiftCard,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createReorderPO,
  AdminError,
} from "@/server/services/admin";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string; ok?: boolean; message?: string };

async function requireAdmin(permission: Parameters<typeof assert>[1]) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin");
  assert(session.user.role, permission);
  return session.user;
}

function boolFromForm(fd: FormData, key: string) {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

async function uploadProductImage(file: File) {
  const bytes = await file.arrayBuffer();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  return getStorage().putObject(key, Buffer.from(bytes), file.type || `image/${safeExt}`);
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("product.write");
  const imageFile = formData.get("imageFile") as File | null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (imageFile && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/")) {
      return { error: "Only image files are allowed." };
    }
    imageUrl = await uploadProductImage(imageFile);
  }

  const parsed = productUpsertSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceMajor: formData.get("priceMajor"),
    categoryId: formData.get("categoryId") ?? "",
    featured: boolFromForm(formData, "featured"),
    active: boolFromForm(formData, "active"),
    imageUrl,
    stock: formData.get("stock") ?? 0,
    specsJson: String(formData.get("specsJson") ?? "[]"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await createProduct(parsed.data, user.id);
  } catch (err) {
    if (err instanceof AdminError) return { error: err.message };
    logger.error({ err }, "createProduct failed");
    return { error: "Failed to create product" };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("product.write");

  const imageFile = formData.get("imageFile") as File | null;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (imageFile && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/")) {
      return { error: "Only image files are allowed." };
    }
    imageUrl = await uploadProductImage(imageFile);
  }

  const parsed = productUpsertSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceMajor: formData.get("priceMajor"),
    categoryId: formData.get("categoryId") ?? "",
    featured: boolFromForm(formData, "featured"),
    active: boolFromForm(formData, "active"),
    imageUrl,
    stock: formData.get("stock") ?? 0,
    specsJson: String(formData.get("specsJson") ?? "[]"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await updateProduct(id, parsed.data, user.id);
  } catch (err) {
    if (err instanceof AdminError) return { error: err.message };
    logger.error({ err }, "updateProduct failed");
    return { error: "Failed to update product" };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireAdmin("product.write");
  const id = String(formData.get("id"));
  try {
    await deleteProduct(id, user.id);
  } catch (err) {
    logger.error({ err }, "deleteProduct failed");
  }
  revalidatePath("/admin/products");
}

export async function adjustInventoryAction(formData: FormData) {
  const user = await requireAdmin("inventory.write");
  const parsed = inventoryAdjustSchema.safeParse({
    variantId: formData.get("variantId"),
    delta: formData.get("delta"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success) return;
  try {
    await adjustInventory(parsed.data.variantId, parsed.data.delta, parsed.data.reason, user.id);
  } catch (err) {
    logger.error({ err }, "adjustInventory failed");
  }
  revalidatePath("/admin/products");
}

export async function createCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("admin.access");
  const parsed = couponCreateSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    type: formData.get("type"),
    value: formData.get("value") ?? 0,
    minSpendMajor: formData.get("minSpendMajor") ?? 0,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    await createCoupon(parsed.data, user.id);
  } catch (err) {
    if (err instanceof AdminError) return { error: err.message };
    logger.error({ err }, "createCoupon failed");
    return { error: "Failed to create coupon" };
  }
  revalidatePath("/admin/marketing");
  return { ok: true };
}

export async function toggleCouponAction(formData: FormData) {
  const user = await requireAdmin("admin.access");
  try {
    await toggleCoupon(String(formData.get("id")), user.id);
  } catch (err) {
    logger.error({ err }, "toggleCoupon failed");
  }
  revalidatePath("/admin/marketing");
}

export async function toggleFeatureFlagAction(formData: FormData) {
  const user = await requireAdmin("admin.access");
  const key = String(formData.get("key"));
  const enabled = String(formData.get("enabled")) === "true";
  if (key !== "ai_assistant") return;

  try {
    await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled },
      create: { key, enabled },
    });
  } catch (err) {
    logger.error({ err, key, enabled }, "toggleFeatureFlag failed");
  }

  revalidatePath("/admin/marketing");
}

export async function createGiftCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("admin.access");
  const amount = Number(formData.get("amountMajor"));
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a positive amount." };
  try {
    const gc = await createGiftCard(amount, user.id);
    revalidatePath("/admin/marketing");
    return { ok: true, message: `Created ${gc.code}` };
  } catch (err) {
    logger.error({ err }, "createGiftCard failed");
    return { error: "Failed to create gift card" };
  }
}

export async function createSupplierAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("admin.access");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Supplier name is required." };
  try {
    await createSupplier(
      { name, email: String(formData.get("email") ?? ""), phone: String(formData.get("phone") ?? "") },
      user.id,
    );
  } catch (err) {
    logger.error({ err }, "createSupplier failed");
    return { error: "Failed to create supplier" };
  }
  revalidatePath("/admin/suppliers");
  return { ok: true };
}

export async function updateSupplierAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("admin.access");
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Supplier name is required." };
  try {
    await updateSupplier(
      id,
      { name, email: String(formData.get("email") ?? ""), phone: String(formData.get("phone") ?? "") },
      user.id,
    );
  } catch (err) {
    if (err instanceof AdminError) return { error: err.message };
    logger.error({ err }, "updateSupplier failed");
    return { error: "Failed to update supplier" };
  }
  revalidatePath("/admin/suppliers");
  return { ok: true };
}

export async function deleteSupplierAction(formData: FormData) {
  const user = await requireAdmin("admin.access");
  try {
    await deleteSupplier(String(formData.get("id")), user.id);
  } catch (err) {
    logger.error({ err }, "deleteSupplier failed");
  }
  revalidatePath("/admin/suppliers");
}

export async function createReorderPOAction(formData: FormData) {
  const user = await requireAdmin("inventory.write");
  try {
    await createReorderPO(String(formData.get("supplierId")), user.id);
  } catch (err) {
    logger.error({ err }, "createReorderPO failed");
  }
  revalidatePath("/admin/suppliers");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin("order.read"); // staff+ can moderate reviews
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      const agg = await tx.review.aggregate({ where: { productId }, _avg: { rating: true } });
      await tx.product.update({ where: { id: productId }, data: { rating: agg._avg.rating ?? 0 } });
    });
  } catch (err) {
    logger.error({ err }, "deleteReview failed");
  }
  revalidatePath("/admin/reviews");
}

export async function updateOrderStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("order.write");
  const parsed = orderStatusUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid status update" };
  try {
    await updateOrderStatus(parsed.data.orderId, parsed.data.status as OrderStatus, user.id);
  } catch (err) {
    if (err instanceof AdminError) return { error: err.message };
    logger.error({ err }, "updateOrderStatus failed");
    return { error: "Failed to update order" };
  }
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
