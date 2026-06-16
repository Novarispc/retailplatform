import { Hero } from "@/components/magic/hero";
import { listFeaturedProducts } from "@/server/services/catalog";
import { isEnabled } from "@/lib/flags";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import type { HeroProduct } from "@/components/magic/hero";

export const dynamic = "force-dynamic";

export default async function DisplayPage() {
  const [featured, assistantEnabled] = await Promise.all([listFeaturedProducts(8), isEnabled("ai_assistant")]);

  const products: HeroProduct[] = featured.map((p) => ({
    slug: p.slug,
    name: p.name,
    blurb: p.category?.name ?? "",
    price: formatMoney(p.variants?.[0]?.priceMinor ?? 0, p.currency as CurrencyCode),
    imageUrl: p.images?.[0]?.url ?? null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021018] to-[#051421]">
      <Hero products={products} assistantEnabled={assistantEnabled} />
    </div>
  );
}
