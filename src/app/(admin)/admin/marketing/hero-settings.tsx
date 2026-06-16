"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { updateHeroSettingsAction } from "@/server/actions/store";
import type { HeroSettings } from "@/server/services/store";

type ProductOption = { slug: string; name: string; featured: boolean };

export function HeroSettingsForm({
  initial,
  products = [],
}: {
  initial: HeroSettings;
  products?: ProductOption[];
}) {
  const [state, action, pending] = useActionState(updateHeroSettingsAction, { ok: false } as { ok?: boolean; error?: string });
  const [badges, setBadges] = useState(() => {
    const heroBadges = Array.isArray(initial.badges) ? initial.badges : [];
    return heroBadges
      .map((badge) => (typeof badge === "object" && badge ? `${badge.title ?? ""} | ${badge.subtitle ?? ""}` : ""))
      .join("\n");
  });

  const initialTrending = Array.isArray(initial.trendingSlugs) ? initial.trendingSlugs : [];
  // Selected slugs in admin-chosen order; defaults to featured products if none set yet.
  const [trending, setTrending] = useState<string[]>(() =>
    initialTrending.length
      ? initialTrending.slice(0, 8)
      : products.filter((p) => p.featured).slice(0, 8).map((p) => p.slug),
  );
  const [picker, setPicker] = useState("");

  const trendingDetails = trending
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is ProductOption => Boolean(p));
  const available = products.filter((p) => !trending.includes(p.slug));

  const addTrending = (slug: string) => {
    if (!slug || trending.includes(slug) || trending.length >= 8) return;
    setTrending((t) => [...t, slug]);
    setPicker("");
  };
  const removeTrending = (slug: string) => setTrending((t) => t.filter((s) => s !== slug));

  return (
    <form id="hero-settings" action={action} className="glass rounded-2xl p-6" suppressHydrationWarning>
      <h2 className="mb-4 text-lg font-semibold">Homepage hero settings</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="titleA">Headline part A</Label>
          <input
            id="titleA"
            name="titleA"
            defaultValue={String(initial.titleA ?? "")}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="Shop premium cricket essentials"
          />
        </div>
        <div>
          <Label htmlFor="titleB">Headline part B</Label>
          <input
            id="titleB"
            name="titleB"
            defaultValue={String(initial.titleB ?? "")}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="that empower your game"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="subtitle">Subtitle</Label>
        <textarea
          id="subtitle"
          name="subtitle"
          defaultValue={String(initial.subtitle ?? "")}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
          placeholder="Fast delivery across India, curated by cricket experts."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <div>
          <Label htmlFor="ctaLabel">CTA label</Label>
          <input
            id="ctaLabel"
            name="ctaLabel"
            defaultValue={String(initial.ctaLabel ?? "")}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="Shop now"
          />
        </div>
        <div>
          <Label htmlFor="ctaHref">CTA URL</Label>
          <input
            id="ctaHref"
            name="ctaHref"
            defaultValue={String(initial.ctaHref ?? "")}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="/catalog"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="badges">Feature badges</Label>
        <textarea
          id="badges"
          name="badges"
          value={badges}
          onChange={(event) => setBadges(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
          placeholder="Ready to ship | Fast delivery across India\n100% genuine | Official bat and gear brands"
        />
        <p className="mt-2 text-xs text-muted">One badge per line, use <strong>title | subtitle</strong>.</p>
      </div>

      {/* ── Now trending hero items ── */}
      <div className="mt-6">
        <Label>Now trending items</Label>
        <p className="mb-2 mt-1 text-xs text-muted">
          Products shown in the homepage hero carousel and thumbnails (max 8). Leave empty to fall back to featured products.
        </p>

        {/* persisted selection */}
        {trending.map((slug) => (
          <input key={slug} type="hidden" name="trending" value={slug} />
        ))}

        {trendingDetails.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-sm text-muted">
            No items selected — hero will use featured products.
          </p>
        ) : (
          <ul className="space-y-2">
            {trendingDetails.map((p, i) => (
              <li
                key={p.slug}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted">{i + 1}.</span>
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeTrending(p.slug)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {trending.length < 8 && available.length > 0 && (
          <div className="mt-3 flex gap-2">
            <select
              value={picker}
              onChange={(e) => addTrending(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">＋ Add a product…</option>
              {available.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save hero settings"}</Button>
        {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
        {state?.ok && <p className="text-sm text-success">Saved.</p>}
      </div>
    </form>
  );
}
