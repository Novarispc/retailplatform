import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, Sparkles, RefreshCw, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/magic/hero";
import { TrustSection } from "@/components/magic/trust-section";
import { ProductGrid } from "@/components/magic/product-grid";
import { CmsRenderer } from "@/components/magic/cms-renderer";
import { listFeaturedProducts, listCategories } from "@/server/services/catalog";
import { getCmsBlocksForPage } from "@/server/services/cms";
import { toCardData } from "@/types/catalog";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { isEnabled } from "@/lib/flags";
import type { HeroProduct } from "@/components/magic/hero";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Truck, title: "Free shipping", text: "On orders over ₹3,000" },
  { icon: ShieldCheck, title: "Authentic gear", text: "100% genuine brands" },
  { icon: RefreshCw, title: "Easy returns", text: "7-day hassle-free returns" },
  { icon: Sparkles, title: "Expert advice", text: "Talk to our cricket staff" },
];

const BRANDS = ["360", "BDM", "DSC", "EM", "GOWIN", "Black Panther"];

const COLLECTIONS = [
  { title: "Player Editions", text: "Premium, professional-grade bats designed for elite players." },
  { title: "Grade 1 Willow", text: "Our highest standard of willow, favoured by professional cricketers." },
  { title: "Big Blade", text: "40mm+ edges and 1170g+ profiles built for the hard hitters." },
  { title: "Lite Weight", text: "1100–1160g bats engineered for fast-handed top-order batsmen." },
];

export default async function HomePage() {
  const [featured, categories, cmsBlocks, t, assistantEnabled] = await Promise.all([
    listFeaturedProducts(8),
    listCategories(),
    getCmsBlocksForPage("homepage"),
    getTranslations("home"),
    isEnabled("ai_assistant"),
  ]);

  const heroProducts: HeroProduct[] = featured.map((p) => ({
    slug: p.slug,
    name: p.name,
    blurb: p.category?.name ?? "",
    price: formatMoney(p.variants?.[0]?.priceMinor ?? 0, p.currency as CurrencyCode),
    imageUrl: p.images?.[0]?.url ?? null,
  }));

  return (
    <div className="space-y-24 pb-8">
      <Hero products={heroProducts} assistantEnabled={assistantEnabled} />

      {/* Feature band */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass card-lift flex items-center gap-3 rounded-2xl p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/10 text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/20">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CMS blocks (banners, collections, rich text managed in /admin/cms) */}
      {cmsBlocks.length > 0 && (
        <CmsRenderer blocks={cmsBlocks.map((b) => ({ ...b, dataJson: b.dataJson as Record<string, unknown> }))} />
      )}

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Browse the kit</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("shopByCategory")}</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="card-lift group relative h-48 overflow-hidden rounded-[var(--radius)] border border-[var(--border)]"
            >
              {c.imageUrl && (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover opacity-55 transition-all duration-700 ease-[var(--ease-out)] group-hover:scale-110 group-hover:opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="line-clamp-1 text-sm text-muted">{c.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bat collections */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-6 max-w-2xl">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Curated by our experts</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Only the best for you</h2>
          <p className="mt-2 text-sm text-muted">
            Our team of experts has curated a selection of English willow bats, ensuring only the
            finest choices for your cricket needs.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.title}
              href="/catalog"
              className="glass card-lift group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted">{c.text}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Picked for you</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("featured")}</h2>
          </div>
          <Link href="/catalog" className="group inline-flex items-center gap-1 text-sm text-[var(--accent)]">
            {t("viewAll")} <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        <ProductGrid products={featured.map(toCardData)} />
      </section>

      {/* Where The Trust Builds — admin-published media */}
      <TrustSection />

      {/* Trusted brands */}
      <section className="mx-auto max-w-6xl px-6">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Trusted brands we stock
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-muted transition-colors hover:border-[var(--accent)]/40 hover:text-foreground"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Visit the store */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="glass grid gap-8 overflow-hidden rounded-[var(--radius)] p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Visit us</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jodhpur&apos;s cricket store</h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              Where the trust builds. A Sports Zone stocks cricket bats, shoes, combos and sports
              accessories from top brands. Visit our store in Sardarpura or order online — we ship
              to 200+ countries.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=119+IInd+B+Road+Sardarpura+Jodhpur+Rajasthan+342003"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Get directions
              </a>
              <a
                href="https://instagram.com/asportszone/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                @asportszone
              </a>
            </div>
          </div>
          <ul className="space-y-4 self-center text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
              <span>119, IInd B Road, Sardarpura,<br />Jodhpur, Rajasthan 342003</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              <span>Mon–Sat, 10:00 AM – 9:00 PM</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
