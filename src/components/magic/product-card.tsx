"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Star, Plus, ImageOff } from "lucide-react";
import { useCart } from "@/stores/cart";
import { WishlistButton } from "./wishlist-button";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import type { ProductCardData } from "@/types/catalog";

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const add = useCart((s) => s.add);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.defaultVariantId) return;
    add({
      variantId: product.defaultVariantId,
      productSlug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPriceMinor: product.priceMinor,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="card-lift group relative block overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="shine relative aspect-square overflow-hidden bg-[var(--surface-2)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)]/15 px-2.5 py-1 text-xs font-medium text-[var(--accent)] backdrop-blur">
              Featured
            </span>
          )}
          <div className="absolute bottom-3 right-3 flex gap-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <WishlistButton
              item={{ productSlug: product.slug, name: product.name, imageUrl: product.imageUrl, priceMinor: product.priceMinor }}
            />
            <button
              onClick={quickAdd}
              aria-label={`Add ${product.name} to cart`}
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[#06070d] shadow-lg"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted">{product.categoryName}</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Star className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" />
              {product.rating.toFixed(1)}
            </span>
          </div>
          <h3 className="line-clamp-1 font-medium transition-colors group-hover:text-[var(--accent)]">{product.name}</h3>
          <p className="tnum mt-2 text-lg font-semibold gradient-text">
            {formatMoney(product.priceMinor, product.currency as CurrencyCode)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
