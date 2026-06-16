import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the active tenant. M1 uses the single default tenant (env slug);
 * later milestones resolve by StoreDomain/host header.
 */
export const getActiveTenant = cache(async () => {
  const slug = process.env.DEFAULT_TENANT_SLUG ?? "default";
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) throw new Error(`Default tenant "${slug}" not found — run npm run db:seed`);
  return tenant;
});
