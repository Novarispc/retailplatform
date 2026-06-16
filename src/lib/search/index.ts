// SearchProvider abstraction. Postgres implementation for M1;
// Meilisearch/Typesense/AI search implement the same interface later.
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface SearchParams {
  tenantId: string;
  query?: string;
  categorySlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  minPriceMinor?: number;
  maxPriceMinor?: number;
  /** Spec facet filters: { "Brand": "Sony", "Color": "Black" } */
  specs?: Record<string, string>;
  page?: number;
  pageSize?: number;
}

export interface SearchProvider {
  searchProducts(params: SearchParams): Promise<{
    items: Awaited<ReturnType<typeof queryProducts>>["items"];
    total: number;
    page: number;
    pageSize: number;
  }>;
}

async function queryProducts(params: SearchParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, params.pageSize ?? 12);

  const where: Prisma.ProductWhereInput = {
    tenantId: params.tenantId,
    active: true,
    ...(params.query
      ? {
          OR: [
            { name: { contains: params.query, mode: "insensitive" } },
            { description: { contains: params.query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(params.categorySlug
      ? { category: { slug: params.categorySlug } }
      : {}),
    ...(params.minPriceMinor !== undefined || params.maxPriceMinor !== undefined
      ? {
          priceMinor: {
            ...(params.minPriceMinor !== undefined ? { gte: params.minPriceMinor } : {}),
            ...(params.maxPriceMinor !== undefined ? { lte: params.maxPriceMinor } : {}),
          },
        }
      : {}),
    ...(params.specs && Object.keys(params.specs).length > 0
      ? {
          AND: Object.entries(params.specs).map(([k, v]) => ({
            productSpecs: { some: { key: k, value: v } },
          })),
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { priceMinor: "asc" }
      : params.sort === "price_desc"
        ? { priceMinor: "desc" }
        : params.sort === "rating"
          ? { rating: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
        variants: { take: 1, orderBy: { sku: "asc" } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

class PostgresSearch implements SearchProvider {
  async searchProducts(params: SearchParams) {
    return queryProducts(params);
  }
}

let provider: SearchProvider | null = null;
export function getSearch(): SearchProvider {
  if (!provider) provider = new PostgresSearch();
  return provider;
}
