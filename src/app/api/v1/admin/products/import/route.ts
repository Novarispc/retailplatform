import { NextResponse } from "next/server";
import Papa from "papaparse";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface CsvRow {
  name?: string;
  slug?: string;
  description?: string;
  priceMajor?: string;
  currency?: string;
  stock?: string;
  active?: string;
  featured?: string;
  category?: string;
  imageUrl?: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "product.write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expects multipart/form-data with a 'file' field" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not parse form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }
  if (!file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "Only .csv files accepted" }, { status: 400 });
  }

  const text = await file.text();
  const { data, errors } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });

  if (errors.length) {
    return NextResponse.json({ error: "CSV parse error", details: errors.slice(0, 5) }, { status: 422 });
  }
  if (data.length === 0) {
    return NextResponse.json({ error: "CSV has no rows" }, { status: 422 });
  }
  if (data.length > 1000) {
    return NextResponse.json({ error: "Max 1000 rows per import" }, { status: 422 });
  }

  const tenant = await getActiveTenant();
  let created = 0;
  let updated = 0;
  const errs: { row: number; error: string }[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row.name?.trim();
    if (!name) { errs.push({ row: i + 2, error: "name required" }); continue; }
    if (name.length > 200) { errs.push({ row: i + 2, error: "name too long (max 200)" }); continue; }

    const slug = row.slug?.trim() ? slugify(row.slug) : slugify(name);
    if (!slug) { errs.push({ row: i + 2, error: "name produces empty slug" }); continue; }
    const priceMinor = Math.round((Number(row.priceMajor) || 0) * 100);
    const currency = row.currency?.trim().toUpperCase() || "INR";
    const stock = Math.max(0, Number(row.stock) || 0);
    const active = row.active === undefined || row.active.toLowerCase() !== "false";
    const featured = row.featured?.toLowerCase() === "true";
    const description = row.description?.trim() || name;

    // Resolve optional category by name.
    let categoryId: string | undefined;
    if (row.category?.trim()) {
      const catName = row.category.trim();
      if (catName.length > 80) { errs.push({ row: i + 2, error: "category name too long (max 80)" }); continue; }
      const cat = await prisma.category.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: slugify(catName) } },
        update: {},
        create: { tenantId: tenant.id, name: catName, slug: slugify(catName) },
      });
      categoryId = cat.id;
    }

    try {
      const existing = await prisma.product.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        include: { variants: { include: { inventory: true }, take: 1 } },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: { name, description, priceMinor, currency, active, featured, ...(categoryId ? { categoryId } : {}) },
        });
        // Update stock on default variant if one exists.
        const variant = existing.variants[0];
        if (variant?.inventory) {
          await prisma.inventory.update({ where: { id: variant.inventory.id }, data: { quantity: stock } });
        }
        updated++;
      } else {
        await prisma.product.create({
          data: {
            tenantId: tenant.id,
            name,
            slug,
            description,
            priceMinor,
            currency,
            active,
            featured,
            ...(categoryId ? { categoryId } : {}),
            ...(row.imageUrl?.trim() ? { images: { create: { url: row.imageUrl.trim(), position: 0 } } } : {}),
            variants: {
              create: {
                sku: `${slug}-default`,
                name: "Standard",
                inventory: { create: { quantity: stock } },
              },
            },
          },
        });
        created++;
      }
    } catch (err) {
      logger.warn({ err, row: i + 2, slug }, "import row failed");
      errs.push({ row: i + 2, error: String(err instanceof Error ? err.message : err) });
    }
  }

  return NextResponse.json({ created, updated, errors: errs }, { status: errs.length ? 207 : 200 });
}
