// Shared shape for product cards/grids across server + client components.
export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  rating: number;
  featured: boolean;
  categoryName: string | null;
  imageUrl: string | null;
  defaultVariantId: string | null;
}

// Map a Prisma product (with images[0], category, variants[0]) to card data.
export function toCardData(p: {
  id: string;
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  rating: number;
  featured: boolean;
  category?: { name: string } | null;
  images?: { url: string }[];
  variants?: { id: string }[];
}): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceMinor: p.priceMinor,
    currency: p.currency,
    rating: p.rating,
    featured: p.featured,
    categoryName: p.category?.name ?? null,
    imageUrl: p.images?.[0]?.url ?? null,
    defaultVariantId: p.variants?.[0]?.id ?? null,
  };
}
