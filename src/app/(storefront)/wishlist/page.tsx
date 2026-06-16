"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/stores/wishlist";
import { useCart } from "@/stores/cart";
import { useMounted } from "@/lib/use-mounted";
import { formatMoney } from "@/lib/money";

export default function WishlistPage() {
  const mounted = useMounted();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addToCart = useCart((s) => s.add);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Heart className="h-7 w-7 text-[var(--danger)]" /> Wishlist
      </h1>
      <p className="mb-8 text-muted">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>

      {items.length === 0 ? (
        <div className="glass rounded-[var(--radius)] p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[var(--border)]" />
          <p className="mb-4 text-muted">Nothing saved yet.</p>
          <Link
            href="/catalog"
            className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-2.5 text-sm font-semibold text-[#06070d]"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.productSlug}
              className="glass flex items-center gap-4 rounded-[var(--radius)] p-4"
            >
              <Link href={`/product/${item.productSlug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.productSlug}`} className="line-clamp-1 font-medium hover:text-[var(--accent)]">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm font-semibold gradient-text">{formatMoney(item.priceMinor)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    addToCart({ variantId: item.productSlug + "-default", productSlug: item.productSlug, name: item.name, imageUrl: item.imageUrl, unitPriceMinor: item.priceMinor });
                  }}
                  aria-label="Add to cart"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-muted transition-colors hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
                >
                  <ShoppingBag className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(item.productSlug)}
                  aria-label="Remove"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-muted transition-colors hover:bg-[var(--danger)]/15 hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
