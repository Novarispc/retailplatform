"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cart";
import { useUiStore } from "@/stores/ui";
import Toasts from "@/components/ui/toast";

export type HeroProduct = {
  slug: string;
  name: string;
  blurb: string;
  price: string;
  imageUrl: string | null;
  defaultVariantId?: string | null;
  priceMinor?: number;
  currency?: string;
};

export type HeroBadge = {
  title: string;
  subtitle: string;
};

export type HeroSettings = {
  titleA?: string;
  titleB?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  badges?: HeroBadge[];
};

const FLOATING = [
  { left: "8%", top: "18%", size: 7, delay: 0 },
  { left: "88%", top: "24%", size: 5, delay: 0.6 },
  { left: "72%", top: "10%", size: 4, delay: 1.1 },
  { left: "18%", top: "68%", size: 6, delay: 0.3 },
  { left: "92%", top: "62%", size: 4, delay: 0.9 },
  { left: "44%", top: "16%", size: 3, delay: 1.4 },
];

const FEATURE_BADGES = [
  { title: "Ready to ship", subtitle: "Fast delivery across India" },
  { title: "100% genuine", subtitle: "Official bat and gear brands" },
  { title: "Curated picks", subtitle: "Top-rated cricket essentials" },
];

export function Hero({
  products,
  assistantEnabled,
  heroSettings,
}: {
  products: HeroProduct[];
  assistantEnabled: boolean;
  heroSettings?: HeroSettings;
}) {
  const t = useTranslations("hero");
  const [activeIndex, setActiveIndex] = useState(0);
  const add = useCart((s) => s.add);
  const addToast = useUiStore((s) => s.addToast);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const heroTitleA = heroSettings?.titleA?.trim() || t("titleA");
  const heroTitleB = heroSettings?.titleB?.trim() || t("titleB");
  const heroSubtitle = heroSettings?.subtitle?.trim() || t("subtitle");
  const heroCtaLabel = heroSettings?.ctaLabel?.trim() || t("explore");
  const heroCtaHref = heroSettings?.ctaHref?.trim() || "/catalog";
  const heroBadges = heroSettings?.badges?.length ? heroSettings.badges : FEATURE_BADGES;

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % products.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [products.length]);

  const handleAdd = (product: HeroProduct, index: number) => {
    // set visible product and add the default variant to cart if available
    setActiveIndex(index);
    if (!product.defaultVariantId) return;
    add({
      variantId: product.defaultVariantId!,
      productSlug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPriceMinor: product.priceMinor ?? 0,
    });
    // show transient feedback and toast
    setAddedIds((s) => ({ ...s, [product.defaultVariantId ?? product.slug]: true }));
    addToast(`${product.name} added to cart`, "success", 1800);
    window.setTimeout(() => setAddedIds((s) => ({ ...s, [product.defaultVariantId ?? product.slug]: false })), 1800);
  };

  const active = products[activeIndex] ?? products[0] ?? {
    slug: "",
    name: "SS Gladiator Batting Gloves",
    blurb: "Premium leather · Velcro closure · MRH",
    price: "₹3,500",
    imageUrl: null,
  };

  return (
    <section className="relative min-h-[48vh] overflow-hidden px-6 pb-10 pt-18 sm:pb-12 sm:pt-16">
      <Toasts />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,186,0,0.13),transparent_28%)]" />
      {FLOATING.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full -z-10"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, var(--accent), transparent 70%)",
          }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr] items-center">
        <div className="relative z-20 space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-white/80">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Featured showcase
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold leading-tight tracking-tight">
            {heroTitleA} <span className="gradient-text">{heroTitleB}</span>
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-muted">{heroSubtitle}</p>

          <div className="flex flex-wrap gap-4">
            <Link href={heroCtaHref}>
              <Button size="lg">
                {heroCtaLabel} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {assistantEnabled && (
              <Link href="/catalog?assistant=1">
                <Button size="lg" variant="secondary">
                  <Bot className="h-4 w-4" /> {t("assistant")}
                </Button>
              </Link>
            )}
            <Link href="/display">
              <Button size="lg" variant="secondary">
                View fullscreen
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroBadges.map((badge) => (
              <div key={badge.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">{badge.title}</p>
                <p className="mt-1 text-xs text-muted">{badge.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071018]/95 p-6 shadow-[0_38px_90px_-26px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Now trending</p>
                <h2 className="mt-4 text-3xl font-semibold">{active.name}</h2>
                <p className="mt-3 text-sm text-muted">{active.blurb}</p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                Best seller
              </span>
            </div>

            <div className="mt-6 aspect-[16/10] relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[var(--accent)]/14 via-transparent to-transparent p-3">
              {active.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 520px"
                  className="object-contain transition-transform duration-400 ease-[var(--ease-out)]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">No image available</div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-3xl font-bold gradient-text">{active.price}</span>
              <Link
                href={active.slug ? `/product/${active.slug}` : "/catalog"}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                View product <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {products.slice(0, 4).map((product, index) => (
                <button
                  key={product.slug || index}
                  type="button"
                  onClick={() => handleAdd(product, index)}
                  aria-label={product.name}
                  className={`group relative flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg border p-0 transition ${
                    index === activeIndex
                      ? "ring-2 ring-[var(--accent)]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="relative h-full w-full bg-[var(--surface-2)]">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted">No image</div>
                    )}
                  </div>

                  {product.defaultVariantId && addedIds[product.defaultVariantId] && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-[var(--success)]/95 px-2 py-1 text-xs font-semibold text-white">Added</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
