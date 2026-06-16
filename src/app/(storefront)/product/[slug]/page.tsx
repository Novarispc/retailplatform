export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/services/catalog";
import { ProductGallery } from "@/components/magic/product-gallery";
import { BuyPanel, type BuyVariant } from "@/components/magic/buy-panel";
import { ProductGrid } from "@/components/magic/product-grid";
import { ReviewsSection } from "@/components/magic/reviews-section";
import { WishlistButton } from "@/components/magic/wishlist-button";
import { TrackView } from "@/components/magic/track-view";
import { RecentlyViewed } from "@/components/magic/recently-viewed";
import { effectiveUnitPrice } from "@/server/services/pricing";
import { toCardData } from "@/types/catalog";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants: BuyVariant[] = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    priceMinor: effectiveUnitPrice(product.priceMinor, v.priceMinor),
    available: (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0),
  }));

  const [related, session] = await Promise.all([
    getRelatedProducts({ productId: product.id, categoryId: product.categoryId, take: 4 }),
    auth(),
  ]);

  const existingReview = session?.user
    ? await prisma.review.findFirst({ where: { productId: product.id, userId: session.user.id } })
    : null;
  const canReview = !!session?.user && !existingReview;

  const specs = (product.specs ?? {}) as Record<string, string>;

  // Schema.org Product JSON-LD for SEO / rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    category: product.category?.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: Math.max(1, product.reviews.length),
    },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceMinor / 100).toFixed(2),
      availability: variants.some((v) => v.available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView item={{
        productSlug: product.slug,
        name: product.name,
        imageUrl: product.images[0]?.url ?? null,
        priceMinor: product.priceMinor,
        category: product.category?.name ?? null,
      }} />

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.category && (
            <p className="mb-2 text-sm text-[var(--accent)]">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--border)]"}`}
                />
              ))}
            </span>
            {product.rating.toFixed(1)} · {product.reviews.length} reviews
          </div>

          <p className="mt-6 text-muted">{product.description}</p>

          <div className="my-8 h-px bg-[var(--border)]" />

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <BuyPanel
                productSlug={product.slug}
                productName={product.name}
                currency={product.currency}
                imageUrl={product.images[0]?.url ?? null}
                variants={variants}
              />
            </div>
            <WishlistButton
              item={{
                productSlug: product.slug,
                name: product.name,
                imageUrl: product.images[0]?.url ?? null,
                priceMinor: product.priceMinor,
              }}
              className="mt-1 shrink-0"
            />
          </div>

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-semibold">Specifications</h2>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)]">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="bg-[var(--surface)] p-4">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-1 text-sm font-medium">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        initialReviews={product.reviews}
        canReview={canReview}
      />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">You might also like</h2>
          <ProductGrid products={related.map(toCardData)} />
        </section>
      )}

      <RecentlyViewed excludeSlug={product.slug} />

      <span className="sr-only">{formatMoney(product.priceMinor, product.currency as CurrencyCode)}</span>
    </div>
  );
}
