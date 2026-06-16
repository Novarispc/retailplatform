"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { updateHeroSettingsAction } from "@/server/actions/store";
import type { HeroSettings } from "@/server/services/store";

export function HeroSettingsForm({ initial }: { initial: HeroSettings }) {
  const [state, action, pending] = useActionState(updateHeroSettingsAction, { ok: false } as { ok?: boolean; error?: string });
  const [badges, setBadges] = useState(() => {
    const heroBadges = Array.isArray(initial.badges) ? initial.badges : [];
    return heroBadges
      .map((badge) => (typeof badge === "object" && badge ? `${badge.title ?? ""} | ${badge.subtitle ?? ""}` : ""))
      .join("\n");
  });

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

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save hero settings"}</Button>
        {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
        {state?.ok && <p className="text-sm text-success">Saved.</p>}
      </div>
    </form>
  );
}
