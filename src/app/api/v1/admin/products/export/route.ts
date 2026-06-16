import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

export const runtime = "nodejs";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Bulk export of the product catalog as CSV (admin only).
export async function GET() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "product.read")) {
    return new Response("Forbidden", { status: 403 });
  }
  const tenant = await getActiveTenant();
  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { category: true, variants: { include: { inventory: true }, take: 1, orderBy: { sku: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const header = ["id", "name", "slug", "category", "priceMajor", "currency", "stock", "active", "featured", "rating"];
  const rows = products.map((p) => {
    const inv = p.variants[0]?.inventory;
    return [
      p.id,
      p.name,
      p.slug,
      p.category?.name ?? "",
      (p.priceMinor / 100).toFixed(2),
      p.currency,
      inv ? inv.quantity - inv.reserved : 0,
      p.active,
      p.featured,
      p.rating,
    ]
      .map(csvCell)
      .join(",");
  });
  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
