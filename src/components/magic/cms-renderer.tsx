import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/magic/product-grid";
import { toCardData } from "@/types/catalog";
import { getActiveTenant } from "@/lib/tenant";

type Block = {
  id: string;
  type: "BANNER" | "FEATURED_COLLECTION" | "RICH_TEXT";
  dataJson: Record<string, unknown>;
};

function BannerBlock({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? "");
  const body = String(data.body ?? "");
  const ctaLabel = String(data.ctaLabel ?? "");
  const ctaHref = String(data.ctaHref ?? "");
  const imageUrl = String(data.imageUrl ?? "");

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[var(--radius)] px-6">
      <div className="glass relative flex flex-col items-start gap-4 overflow-hidden rounded-[var(--radius)] p-8 sm:flex-row sm:items-center sm:justify-between">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, 1152px"
            className="object-cover opacity-20"
          />
        )}
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {body && <p className="mt-1 text-muted">{body}</p>}
        </div>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="relative shrink-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-2.5 text-sm font-semibold text-[#06070d] transition-opacity hover:opacity-90"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

async function FeaturedCollectionBlock({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? "");
  const slugsRaw = String(data.productSlugs ?? "");
  const slugs = slugsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) return null;

  const tenant = await getActiveTenant();
  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, slug: { in: slugs }, active: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { take: 1, orderBy: { sku: "asc" } },
    },
  });

  if (products.length === 0) return null;

  // Preserve the slug order from the CMS data.
  const ordered = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <section className="mx-auto max-w-6xl px-6">
      {title && <h2 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h2>}
      <ProductGrid products={ordered.map(toCardData)} />
    </section>
  );
}

function RichTextBlock({ data }: { data: Record<string, unknown> }) {
  const content = String(data.content ?? "");
  if (!content) return null;
  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="glass rounded-[var(--radius)] p-8">
        <p className="whitespace-pre-line leading-relaxed text-muted">{content}</p>
      </div>
    </div>
  );
}

async function RenderBlock({ block }: { block: Block }) {
  if (block.type === "BANNER") return <BannerBlock data={block.dataJson} />;
  if (block.type === "RICH_TEXT") return <RichTextBlock data={block.dataJson} />;
  if (block.type === "FEATURED_COLLECTION") return <FeaturedCollectionBlock data={block.dataJson} />;
  return null;
}

export async function CmsRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-12">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
