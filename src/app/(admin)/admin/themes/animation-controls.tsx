"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ANIMATION_REGISTRY, type AnimationId } from "@/lib/animations/registry";
import { setThemeAnimationsAction, clearThemeAnimationsAction } from "@/server/actions/store";

export function AnimationControls({ active }: { active: AnimationId[] }) {
  const [selected, setSelected] = useState<Set<AnimationId>>(new Set(active));
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(id: AnimationId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function enable() {
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    for (const id of selected) fd.append("animations", id);
    await setThemeAnimationsAction(fd);
    setSaving(false);
    setMsg(selected.size ? `${selected.size} animation${selected.size > 1 ? "s" : ""} enabled.` : "All animations cleared.");
  }

  async function clearAll() {
    setClearing(true);
    setMsg(null);
    setSelected(new Set());
    await clearThemeAnimationsAction();
    setClearing(false);
    setMsg("All animations cleared.");
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--accent)]" />
        <p className="text-sm font-semibold">Theme Animations</p>
      </div>
      <p className="mb-4 text-xs text-muted">
        Overlay seasonal effects sitewide. Multiple can run at once. Visitors who disable
        animations (or have reduced-motion on) won&apos;t see them.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {ANIMATION_REGISTRY.map((a) => {
          const on = selected.has(a.id);
          return (
            <label
              key={a.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                on
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(a.id)}
                className="h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-lg leading-none">{a.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{a.label}</span>
                <span className="block text-xs text-muted">{a.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={enable}
          disabled={saving || clearing}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Enable Selected Animations
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={saving || clearing}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-muted transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50"
        >
          {clearing ? "Clearing…" : "Clear All Animations"}
        </button>
        {msg && <span className="text-xs text-[var(--success)]">{msg}</span>}
      </div>
    </div>
  );
}
