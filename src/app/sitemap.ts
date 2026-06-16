import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getActiveTenant().catch(() => null);
  const products = tenant
    ? await prisma.product.findMany({
        where: { tenantId: tenant.id, active: true },
        select: { slug: true, updatedAt: true },
      })
    : [];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sign-in`, priority: 0.3 },
    { url: `${base}/sign-up`, priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
