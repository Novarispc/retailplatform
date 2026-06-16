import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { getSearch, type SearchParams } from "@/lib/search";

export async function listCategories() {
  const tenant = await getActiveTenant();
  return prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });
}

export async function listFeaturedProducts(take = 6) {
  const tenant = await getActiveTenant();
  return prisma.product.findMany({
    where: { tenantId: tenant.id, active: true, featured: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { take: 1, orderBy: { sku: "asc" } },
    },
    take,
    orderBy: { createdAt: "desc" },
  });
}

/** Fetch products by slug, returned in the same order as the given slug list. */
export async function listProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const tenant = await getActiveTenant();
  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, active: true, slug: { in: slugs } },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { take: 1, orderBy: { sku: "asc" } },
    },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
}

/** Lightweight {slug, name, featured} list of all active products for admin pickers. */
export async function listProductOptions() {
  const tenant = await getActiveTenant();
  return prisma.product.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { slug: true, name: true, featured: true },
    orderBy: { name: "asc" },
  });
}

export async function searchCatalog(params: Omit<SearchParams, "tenantId">) {
  const tenant = await getActiveTenant();
  return getSearch().searchProducts({ ...params, tenantId: tenant.id });
}

export async function getRelatedProducts(opts: {
  productId: string;
  categoryId: string | null;
  take?: number;
}) {
  const tenant = await getActiveTenant();
  return prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      active: true,
      id: { not: opts.productId },
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { take: 1, orderBy: { sku: "asc" } },
    },
    orderBy: { rating: "desc" },
    take: opts.take ?? 4,
  });
}

/**
 * Extract all distinct spec keys + their distinct values across active products.
 * Used to build dynamic facet filters on the catalog page.
 * Returns at most 8 keys, 20 values each, to keep the UI manageable.
 */
export async function listSpecFacets(): Promise<Record<string, string[]>> {
  const tenant = await getActiveTenant();
  const rows = await prisma.productSpec.groupBy({
    by: ["key", "value"],
    where: { product: { tenantId: tenant.id, active: true } },
    _count: { _all: true },
    orderBy: [{ key: "asc" }, { value: "asc" }],
  });

  const facets: Record<string, string[]> = {};
  for (const row of rows) {
    if (!facets[row.key]) facets[row.key] = [];
    if (facets[row.key].length < 20) facets[row.key].push(row.value);
  }

  return Object.fromEntries(Object.entries(facets).slice(0, 8));
}

export async function getProductBySlug(slug: string) {
  const tenant = await getActiveTenant();
  return prisma.product.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      variants: { include: { inventory: true } },
      reviews: { include: { user: { select: { name: true } } }, take: 10, orderBy: { createdAt: "desc" } },
    },
  });
}
