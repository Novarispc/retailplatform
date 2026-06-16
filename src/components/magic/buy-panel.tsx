"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { formatMoney, type CurrencyCode } from "@/lib/money";

export interface BuyVariant {
  id: string;
  name: string;
  priceMinor: number;
  available: number;
}

export function BuyPanel({
  productSlug,
  productName,
  currency,
  imageUrl,
  variants,
}: {
  productSlug: string;
  productName: string;
  currency: string;
  imageUrl: string | null;
  variants: BuyVariant[];
}) {
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const inStock = (variant?.available ?? 0) > 0;

  const handleAdd = () => {
    if (!variant || !inStock) return;
    add(
      {
        variantId: variant.id,
        productSlug,
        name: productName + (variant.name !== "Standard" ? ` — ${variant.name}` : ""),
        imageUrl,
        unitPriceMinor: variant.priceMinor,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="text-3xl font-bold gradient-text">
        {formatMoney(variant?.priceMinor ?? 0, currency as CurrencyCode)}
      </div>

      {variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm text-muted">Options</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  v.id === variantId ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-muted hover:text-foreground"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-[var(--border)] px-2 py-1.5">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(variant?.available ?? 99, q + 1))} aria-label="Increase" className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className={`text-sm ${inStock ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {inStock ? `In stock (${variant.available})` : "Out of stock"}
        </span>
      </div>

      <Button size="lg" className="w-full" onClick={handleAdd} disabled={!inStock}>
        {added ? (
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Check className="h-5 w-5" /> Added to cart
          </motion.span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Add to cart
          </span>
        )}
      </Button>
    </div>
  );
}
