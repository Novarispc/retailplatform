import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/types/catalog";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] p-16 text-center text-muted">
        No products found. Try a different search or filter.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
          <div className="skeleton aspect-square" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
