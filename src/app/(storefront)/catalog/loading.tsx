import { ProductGridSkeleton } from "@/components/magic/product-grid";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="skeleton mb-8 h-9 w-48 rounded" />
      <div className="skeleton mb-6 h-11 w-full rounded-full" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
