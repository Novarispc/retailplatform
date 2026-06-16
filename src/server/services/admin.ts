import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { emit } from "@/lib/events";
import { canTransition } from "./order-status";
import { writeAudit } from "./audit";
import type { ProductUpsertInput } from "@/lib/contracts";
import type { OrderStatus } from "@prisma/client";

export class AdminError extends Error {}

function parseSpecs(json: string | undefined): { key: string; value: string }[] {
  try {
    const arr = JSON.parse(json ?? "[]");
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (s): s is { key: string; value: string } =>
        s && typeof s.key === "string" && s.key.trim() !== "" && typeof s.value === "string" && s.value.trim() !== "",
    );
  } catch {
    return [];
  }
}

const PAGE = 20;

// ── Products ──
export async function listProductsAdmin(opts: { q?: string; page?: number }) {
  const tenant = await getActiveTenant();
  const page = Math.max(1, opts.page ?? 1);
  const where = {
    tenantId: tenant.id,
    ...(opts.q
      ? { name: { contains: opts.q, mode: "insensitive" as const } }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { include: { inventory: true }, take: 1, orderBy: { sku: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE };
}

export async function getProductForEdit(id: string) {
  const tenant = await getActiveTenant();
  const product = await prisma.product.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { include: { inventory: true }, orderBy: { sku: "asc" } },
      productSpecs: { orderBy: { key: "asc" } },
    },
  });
  return product;
}

export async function createProduct(input: ProductUpsertInput, actorId: string) {
  const tenant = await getActiveTenant();
  const dupe = await prisma.product.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug: input.slug } },
  });
  if (dupe) throw new AdminError(`A product with slug "${input.slug}" already exists.`);

  const product = await prisma.product.create({
    data: {
      tenant: { connect: { id: tenant.id } },
      ...(input.categoryId ? { category: { connect: { id: input.categoryId } } } : {}),
      name: input.name,
      slug: input.slug,
      description: input.description,
      priceMinor: Math.round(input.priceMajor * 100),
      currency: "INR",
      featured: input.featured,
      active: input.active,
      ...(input.imageUrl
        ? { images: { create: [{ url: input.imageUrl, alt: input.name, position: 0 }] } }
        : {}),
      variants: {
        create: [
          {
            sku: `${input.slug}-default`,
            name: "Standard",
            inventory: { create: { quantity: input.stock, lowStockThreshold: 5 } },
          },
        ],
      },
    },
    include: { variants: { include: { inventory: true } } },
  });

  const inv = product.variants[0]?.inventory;
  if (inv && input.stock > 0) {
    await prisma.inventoryTransaction.create({
      data: { inventoryId: inv.id, type: "RESTOCK", delta: input.stock, reason: "initial stock", refType: "Product", refId: product.id },
    });
  }

  const specs = parseSpecs(input.specsJson);
  if (specs.length > 0) {
    await prisma.productSpec.createMany({
      data: specs.map((s) => ({ productId: product.id, key: s.key, value: s.value })),
    });
  }

  await writeAudit({ actorId, action: "product.created", entity: "Product", entityId: product.id, meta: { slug: input.slug } });
  return product;
}

export async function updateProduct(id: string, input: ProductUpsertInput, actorId: string) {
  const tenant = await getActiveTenant();
  const existing = await prisma.product.findFirst({
    where: { id, tenantId: tenant.id },
    include: { variants: { include: { inventory: true }, orderBy: { sku: "asc" }, take: 1 }, images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!existing) throw new AdminError("Product not found.");

  // Slug conflict against a different product.
  const slugOwner = await prisma.product.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug: input.slug } },
  });
  if (slugOwner && slugOwner.id !== id) throw new AdminError(`Slug "${input.slug}" is taken.`);

  await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      priceMinor: Math.round(input.priceMajor * 100),
      featured: input.featured,
      active: input.active,
      category: input.categoryId
        ? { connect: { id: input.categoryId } }
        : { disconnect: true },
    },
  });

  // Image: update first or create.
  const firstImage = existing.images[0];
  if (input.imageUrl) {
    if (firstImage) {
      await prisma.productImage.update({ where: { id: firstImage.id }, data: { url: input.imageUrl, alt: input.name } });
    } else {
      await prisma.productImage.create({ data: { productId: id, url: input.imageUrl, alt: input.name, position: 0 } });
    }
  }

  // Stock reconcile via signed adjustment txn.
  const inv = existing.variants[0]?.inventory;
  if (inv && inv.quantity !== input.stock) {
    const delta = input.stock - inv.quantity;
    await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: input.stock } });
    await prisma.inventoryTransaction.create({
      data: { inventoryId: inv.id, type: "ADJUSTMENT", delta, reason: "admin stock edit", refType: "Product", refId: id },
    });
  }

  // Sync EAV specs: replace all.
  await prisma.productSpec.deleteMany({ where: { productId: id } });
  const specs = parseSpecs(input.specsJson);
  if (specs.length > 0) {
    await prisma.productSpec.createMany({
      data: specs.map((s) => ({ productId: id, key: s.key, value: s.value })),
    });
  }

  await writeAudit({ actorId, action: "product.updated", entity: "Product", entityId: id, meta: { slug: input.slug } });
}

export async function deleteProduct(id: string, actorId: string) {
  const tenant = await getActiveTenant();
  const existing = await prisma.product.findFirst({ where: { id, tenantId: tenant.id } });
  if (!existing) throw new AdminError("Product not found.");
  await prisma.product.delete({ where: { id } });
  await writeAudit({ actorId, action: "product.deleted", entity: "Product", entityId: id });
}

export async function adjustInventory(variantId: string, delta: number, reason: string | undefined, actorId: string) {
  const inv = await prisma.inventory.findUnique({ where: { variantId } });
  if (!inv) throw new AdminError("Inventory not found.");
  const next = inv.quantity + delta;
  if (next < 0) throw new AdminError("Adjustment would make stock negative.");
  await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: next } });
  await prisma.inventoryTransaction.create({
    data: { inventoryId: inv.id, type: "ADJUSTMENT", delta, reason: reason ?? "manual adjustment" },
  });
  await writeAudit({ actorId, action: "inventory.adjusted", entity: "Inventory", entityId: inv.id, meta: { delta } });
}

// ── Orders ──
export async function listOrdersAdmin(opts: { status?: OrderStatus; page?: number }) {
  const tenant = await getActiveTenant();
  const page = Math.max(1, opts.page ?? 1);
  const where = { tenantId: tenant.id, ...(opts.status ? { status: opts.status } : {}) };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payment: true, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE };
}

export async function getOrderAdmin(id: string) {
  const tenant = await getActiveTenant();
  return prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      items: { include: { variant: { include: { inventory: true } } } },
      payment: true,
      shippingAddress: true,
      user: { select: { email: true, name: true } },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, actorId: string) {
  const tenant = await getActiveTenant();
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
    include: { items: { include: { variant: { include: { inventory: true } } } }, payment: true },
  });
  if (!order) throw new AdminError("Order not found.");
  if (order.status === status) return; // idempotent
  if (!canTransition(order.status, status)) {
    throw new AdminError(`Cannot move order from ${order.status} to ${status}.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status } });

    if (status === "REFUNDED") {
      if (order.payment) {
        await tx.payment.update({ where: { id: order.payment.id }, data: { status: "REFUNDED" } });
      }
      // Restock refunded items.
      for (const item of order.items) {
        const inv = item.variant.inventory;
        if (!inv) continue;
        await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: item.quantity } } });
        await tx.inventoryTransaction.create({
          data: { inventoryId: inv.id, type: "RETURN", delta: item.quantity, reason: "order refunded", refType: "Order", refId: orderId },
        });
      }
    }
  });

  if (status === "SHIPPED") await emit({ type: "OrderShipped", orderId });
  if (status === "REFUNDED") await emit({ type: "RefundProcessed", orderId, amountMinor: order.totalMinor });
  await writeAudit({ actorId, action: `order.status.${status.toLowerCase()}`, entity: "Order", entityId: orderId, meta: { from: order.status, to: status } });
}

// ── Customers ──
export async function listCustomers(opts: { q?: string; page?: number }) {
  const tenant = await getActiveTenant();
  const page = Math.max(1, opts.page ?? 1);
  const where = {
    tenantId: tenant.id,
    role: "CUSTOMER" as const,
    ...(opts.q ? { email: { contains: opts.q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE };
}

export async function listCategoriesAdmin() {
  const tenant = await getActiveTenant();
  return prisma.category.findMany({ where: { tenantId: tenant.id }, orderBy: { name: "asc" } });
}

// ── Gift cards ──
function giftCardCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GC-${seg()}-${seg()}`;
}

export async function listGiftCards() {
  const tenant = await getActiveTenant();
  return prisma.giftCard.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function createGiftCard(amountMajor: number, actorId: string) {
  const tenant = await getActiveTenant();
  const minor = Math.round(amountMajor * 100);
  const code = giftCardCode();
  const gc = await prisma.giftCard.create({
    data: { tenantId: tenant.id, code, initialMinor: minor, balanceMinor: minor, currency: "INR", active: true },
  });
  await writeAudit({ actorId, action: "giftcard.created", entity: "GiftCard", entityId: gc.id, meta: { code, minor } });
  return gc;
}

// ── Suppliers + purchase orders ──
export async function listSuppliers() {
  const tenant = await getActiveTenant();
  return prisma.supplier.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { purchaseOrders: true } } },
  });
}

export async function createSupplier(
  input: { name: string; email?: string; phone?: string },
  actorId: string,
) {
  const tenant = await getActiveTenant();
  const s = await prisma.supplier.create({
    data: { tenantId: tenant.id, name: input.name, email: input.email || null, phone: input.phone || null },
  });
  await writeAudit({ actorId, action: "supplier.created", entity: "Supplier", entityId: s.id });
  return s;
}

export async function updateSupplier(
  id: string,
  input: { name: string; email?: string; phone?: string },
  actorId: string,
) {
  const tenant = await getActiveTenant();
  const existing = await prisma.supplier.findFirst({ where: { id, tenantId: tenant.id } });
  if (!existing) throw new AdminError("Supplier not found.");
  await prisma.supplier.update({
    where: { id },
    data: { name: input.name, email: input.email || null, phone: input.phone || null },
  });
  await writeAudit({ actorId, action: "supplier.updated", entity: "Supplier", entityId: id });
}

export async function deleteSupplier(id: string, actorId: string) {
  const tenant = await getActiveTenant();
  const existing = await prisma.supplier.findFirst({ where: { id, tenantId: tenant.id } });
  if (!existing) throw new AdminError("Supplier not found.");
  await prisma.supplier.delete({ where: { id } });
  await writeAudit({ actorId, action: "supplier.deleted", entity: "Supplier", entityId: id });
}

export async function listPurchaseOrders() {
  const tenant = await getActiveTenant();
  return prisma.purchaseOrder.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { supplier: true, _count: { select: { items: true } } },
  });
}

/** One-click draft PO: reorder every low-stock variant up to 4× its threshold. */
export async function createReorderPO(supplierId: string, actorId: string) {
  const tenant = await getActiveTenant();
  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, tenantId: tenant.id } });
  if (!supplier) throw new AdminError("Supplier not found.");

  const lowStock = await prisma.inventory.findMany({
    where: { quantity: { lte: 5 }, variant: { product: { tenantId: tenant.id } } },
    include: { variant: { include: { product: true } } },
  });
  if (lowStock.length === 0) throw new AdminError("No low-stock items to reorder.");

  const po = await prisma.purchaseOrder.create({
    data: {
      tenantId: tenant.id,
      supplierId,
      status: "DRAFT",
      notes: `Auto-reorder of ${lowStock.length} low-stock item(s)`,
      items: {
        create: lowStock.map((inv) => ({
          variantId: inv.variantId,
          quantity: Math.max(1, inv.lowStockThreshold * 4 - inv.quantity),
          unitCostMinor: Math.round(inv.variant.product.priceMinor * 0.6), // assume 40% margin
        })),
      },
    },
  });
  await writeAudit({ actorId, action: "po.created", entity: "PurchaseOrder", entityId: po.id, meta: { items: lowStock.length } });
  return po;
}

// ── Marketing: coupons ──
export async function listCoupons() {
  const tenant = await getActiveTenant();
  return prisma.coupon.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } });
}

export async function createCoupon(
  input: { code: string; type: "PERCENT" | "FIXED" | "FREE_SHIPPING"; value: number; minSpendMajor: number; maxRedemptions?: number },
  actorId: string,
) {
  const tenant = await getActiveTenant();
  const code = input.code.trim().toUpperCase();
  const dupe = await prisma.coupon.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code } } });
  if (dupe) throw new AdminError(`Coupon "${code}" already exists.`);

  const coupon = await prisma.coupon.create({
    data: {
      tenantId: tenant.id,
      code,
      type: input.type,
      value: input.type === "FIXED" ? Math.round(input.value * 100) : input.value,
      minSpendMinor: Math.round(input.minSpendMajor * 100),
      maxRedemptions: input.maxRedemptions && input.maxRedemptions > 0 ? input.maxRedemptions : null,
      active: true,
    },
  });
  await writeAudit({ actorId, action: "coupon.created", entity: "Coupon", entityId: coupon.id, meta: { code } });
  return coupon;
}

export async function toggleCoupon(id: string, actorId: string) {
  const tenant = await getActiveTenant();
  const coupon = await prisma.coupon.findFirst({ where: { id, tenantId: tenant.id } });
  if (!coupon) throw new AdminError("Coupon not found.");
  await prisma.coupon.update({ where: { id }, data: { active: !coupon.active } });
  await writeAudit({ actorId, action: "coupon.toggled", entity: "Coupon", entityId: id, meta: { active: !coupon.active } });
}
