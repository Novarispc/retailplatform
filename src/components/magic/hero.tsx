"use client";

import Link from "next/link";
import Image from "next/image";
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
  { left: "8%", top: "22%", size: 7, delay: 0 },
  { left: "82%", top: "30%", size: 5, delay: 0.6 },
  { left: "70%", top: "12%", size: 4, delay: 1.1 },
  { left: "20%", top: "70%", size: 6, delay: 0.3 },
  { left: "90%", top: "62%", size: 4, delay: 0.9 },
  { left: "40%", top: "18%", size: 3, delay: 1.4 },
];

export function Hero({ product }: { product?: HeroProduct }) {
  const t = useTranslations("hero");
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-24">
      {/* floating glow particles */}
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
            background:
              "radial-gradient(circle, var(--accent), transparent 70%)",
          }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-1.5 text-xs text-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            {t("badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            {t("titleA")}{" "}
            <span className="gradient-text">{t("titleB")}</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-md text-lg text-muted"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Link href="/catalog">
              <Button size="lg">
                {t("explore")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/catalog?assistant=1">
              <Button size="lg" variant="secondary">
                <Bot className="h-4 w-4" /> {t("assistant")}
              </Button>
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid max-w-sm grid-cols-3 gap-6"
          >
            {[
              ["40+", t("statProducts")],
              ["4.9★", t("statRating")],
              ["8+", t("statSupport")],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl font-semibold gradient-text">{v}</dt>
                <dd className="text-xs text-muted">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Floating glass showcase card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateY: 12 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm [perspective:1200px]"
        >
          {/* soft halo behind card */}
          <div
            aria-hidden
            className="absolute inset-6 -z-10 rounded-full bg-[var(--accent)]/20 blur-3xl"
          />
          <Link
            href={product ? `/product/${product.slug}` : "/catalog"}
            className="group animate-float gradient-border glow-accent block rounded-[var(--radius)] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted">Featured</span>
              <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs text-[var(--accent)]">
                Best seller
              </span>
            </div>
            <div className="shine relative mb-5 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent-2)]/12 to-transparent">
              {product?.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width:1024px) 90vw, 380px"
                  priority
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105"
                />
              )}
            </div>
            <h3 className="line-clamp-1 text-lg font-semibold">
              {product?.name ?? "SS Gladiator Batting Gloves"}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted">
              {product?.blurb ?? "Premium leather · Velcro closure · MRH"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="tnum text-xl font-bold gradient-text">{product?.price ?? "₹3,500"}</span>
              <Button size="sm">View</Button>
            </div>
          </Link>
          {/* trust chip floating off the card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="glass absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
            100% genuine
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
