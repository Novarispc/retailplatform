import Link from "next/link";
import type { Metadata } from "next";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductGrid } from "@/components/magic/product-grid";
import { searchCatalog, listCategories, listSpecFacets } from "@/server/services/catalog";
import { toCardData } from "@/types/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse cricket bats, combos, shoes and sports accessories at A Sports Zone — where the trust builds.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

const SORTS = [
  ["newest", "Newest"],
  ["price_asc", "Price ↑"],
  ["price_desc", "Price ↓"],
  ["rating", "Top rated"],
] as const;

const PRICE_RANGES = [
  { label: "Any price", min: undefined, max: undefined },
  { label: "Under ₹1,000", min: undefined, max: 100000 },
  { label: "₹1,000 – ₹5,000", min: 100000, max: 500000 },
  { label: "₹5,000 – ₹20,000", min: 500000, max: 2000000 },
  { label: "Over ₹20,000", min: 2000000, max: undefined },
] as const;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;

  const category = str(raw.category);
  const q = str(raw.q);
  const sort = str(raw.sort);
  const page = str(raw.page);
  const minPrice = str(raw.minPrice);
  const maxPrice = str(raw.maxPrice);

  // Extract active spec filters from spec_* URL params.
  const activeSpecs: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith("spec_")) {
      const specKey = k.slice(5);
      const specVal = str(v);
      if (specKey && specVal) activeSpecs[specKey] = specVal;
    }
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const minPriceMinor = minPrice ? Number(minPrice) : undefined;
  const maxPriceMinor = maxPrice ? Number(maxPrice) : undefined;

  const [categories, facets, result] = await Promise.all([
    listCategories(),
    listSpecFacets(),
    searchCatalog({
      categorySlug: category,
      query: q,
      sort: (sort as "newest" | "price_asc" | "price_desc" | "rating") ?? "newest",
      page: pageNum,
      pageSize: 12,
      minPriceMinor,
      maxPriceMinor,
      specs: Object.keys(activeSpecs).length ? activeSpecs : undefined,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  // Build a stable set of base params (no spec_ keys) for sort/price/category links.
  function baseParams(overrides: Record<string, string | undefined> = {}) {
    const out: Record<string, string | undefined> = {
      category, q, sort, minPrice, maxPrice,
      // re-emit current spec filters
      ...Object.fromEntries(Object.entries(activeSpecs).map(([k, v]) => [`spec_${k}`, v])),
      ...overrides,
    };
    // Reset page when filters change.
    if (Object.keys(overrides).some((k) => k !== "page")) delete out.page;
    return out;
  }

  function toggleSpec(key: string, value: string) {
    const next = { ...activeSpecs };
    if (next[key] === value) delete next[key]; else next[key] = value;
    return baseParams({
      // clear all existing spec_ keys then add new ones
      ...Object.fromEntries(Object.keys(activeSpecs).map((k) => [`spec_${k}`, undefined])),
      ...Object.fromEntries(Object.entries(next).map(([k, v]) => [`spec_${k}`, v])),
    });
  }

  const hasPriceFilter = minPriceMinor !== undefined || maxPriceMinor !== undefined;
  const activeFilterCount = Object.keys(activeSpecs).length + (hasPriceFilter ? 1 : 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {category ? categories.find((c) => c.slug === category)?.name ?? "Catalog" : "All products"}
        </h1>
        <p className="mt-1 text-muted">{result.total} product{result.total !== 1 ? "s" : ""}</p>
      </header>

      {/* Search */}
      <form action="/catalog" className="mb-6 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-11 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-5 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
        <button className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 text-sm font-semibold text-[#06070d]">
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={`/catalog${qs(baseParams({ category: undefined }))}`}
          className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors",
            !category ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-muted hover:text-foreground")}
        >All</Link>
        {categories.map((c) => (
          <Link key={c.id}
            href={`/catalog${qs(baseParams({ category: c.slug }))}`}
            className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === c.slug ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-muted hover:text-foreground")}
          >{c.name}</Link>
        ))}
      </div>

      {/* Toolbar: sort segmented control + filter summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-sm">
          {SORTS.map(([key, label]) => {
            const active = (sort ?? "newest") === key;
            return (
              <Link key={key}
                href={`/catalog${qs(baseParams({ sort: key }))}`}
                aria-pressed={active}
                className={cn("rounded-full px-3.5 py-1.5 transition-colors",
                  active ? "bg-[var(--surface-3)] text-foreground shadow-sm" : "text-muted hover:text-foreground")}
              >{label}</Link>
            );
          })}
        </div>
        {activeFilterCount > 0 && (
          <Link
            href={`/catalog${qs({ category, q, sort })}`}
            className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear filters ({activeFilterCount})
          </Link>
        )}
      </div>

      {/* Filters disclosure — collapses price + spec facets into one tidy panel */}
      <details open={activeFilterCount > 0} className="group mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)]/15 px-1.5 text-xs font-semibold text-[var(--accent)]">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </summary>

        <div className="space-y-5 border-t border-[var(--border)] px-4 py-4">
          {/* Price */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-20 shrink-0 text-muted">Price</span>
            {PRICE_RANGES.map((r) => {
              const active =
                (r.min === undefined ? minPriceMinor === undefined : minPriceMinor === r.min) &&
                (r.max === undefined ? maxPriceMinor === undefined : maxPriceMinor === r.max);
              return (
                <Link key={r.label}
                  href={`/catalog${qs(baseParams({
                    minPrice: r.min !== undefined ? String(r.min) : undefined,
                    maxPrice: r.max !== undefined ? String(r.max) : undefined,
                  }))}`}
                  className={cn("rounded-full border px-3 py-1 transition-colors",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-muted hover:text-foreground")}
                >{r.label}</Link>
              );
            })}
          </div>

          {/* Spec facets */}
          {Object.entries(facets).map(([key, values]) => (
            <div key={key} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-20 shrink-0 capitalize text-muted">{key}</span>
              {values.map((val) => {
                const active = activeSpecs[key] === val;
                return (
                  <Link key={val}
                    href={`/catalog${qs(toggleSpec(key, val))}`}
                    className={cn("rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "border-[var(--accent-2)] bg-[var(--accent-2)]/15 text-[var(--accent-2)]"
                        : "border-[var(--border)] text-muted hover:border-[var(--accent-2)]/40 hover:text-foreground")}
                  >{val}</Link>
                );
              })}
            </div>
          ))}
        </div>
      </details>

      <ProductGrid products={result.items.map(toCardData)} />

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <Link key={n}
                href={`/catalog${qs(baseParams({ page: String(n) }))}`}
                className={cn("grid h-10 w-10 place-items-center rounded-full text-sm transition-colors",
                  n === pageNum
                    ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[#06070d]"
                    : "border border-[var(--border)] text-muted hover:text-foreground")}
              >{n}</Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
