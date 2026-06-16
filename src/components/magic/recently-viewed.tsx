"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/stores/recently-viewed";
import { useMounted } from "@/lib/use-mounted";
import { formatMoney } from "@/lib/money";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const mounted = useMounted();
  const items = useRecentlyViewed((s) => s.items);

  if (!mounted) return null;
  const visible = items.filter((i) => i.productSlug !== excludeSlug).slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-semibold">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {visible.map((item) => (
          <Link
            key={item.productSlug}
            href={`/product/${item.productSlug}`}
            className="group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--accent)]/40"
          >
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-[var(--surface-2)]">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill sizes="120px" className="object-cover" />
              )}
            </div>
            <p className="line-clamp-1 text-xs font-medium">{item.name}</p>
            <p className="mt-0.5 text-xs gradient-text font-semibold">{formatMoney(item.priceMinor)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
