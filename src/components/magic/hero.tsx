"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HeroProduct = {
  slug: string;
  name: string;
  blurb: string;
  price: string;
  imageUrl: string | null;
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

export function Hero({ products, assistantEnabled }: { products: HeroProduct[]; assistantEnabled: boolean }) {
  const t = useTranslations("hero");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % products.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [products.length]);

  const active = products[activeIndex] ?? products[0] ?? {
    slug: "",
    name: "SS Gladiator Batting Gloves",
    blurb: "Premium leather · Velcro closure · MRH",
    price: "₹3,500",
    imageUrl: null,
  };

  return (
    <section className="relative min-h-[85vh] overflow-hidden px-6 pb-20 pt-24 sm:pb-32 sm:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,186,0,0.13),transparent_28%)]" />
      {FLOATING.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
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

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="space-y-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-white/80">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Featured showcase
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            {t("titleA")} <span className="gradient-text">{t("titleB")}</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted">{t("subtitle")}</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/catalog">
              <Button size="lg">
                {t("explore")} <ArrowRight className="h-4 w-4" />
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
            {FEATURE_BADGES.map((badge) => (
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
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071018]/95 p-6 shadow-[0_38px_90px_-26px_rgba(0,0,0,0.7)]"
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

            <div className="mt-6 aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-transparent">
              {active.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 520px"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out)] hover:scale-105"
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
                  onClick={() => setActiveIndex(index)}
                  className={`group overflow-hidden rounded-3xl border p-3 text-left transition ${
                    index === activeIndex
                      ? "border-[var(--accent)] bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{product.blurb || "Featured"}</p>
                  <p className="mt-3 font-semibold text-sm leading-snug">{product.name}</p>
                  <p className="mt-2 text-xs text-muted">{product.price}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
