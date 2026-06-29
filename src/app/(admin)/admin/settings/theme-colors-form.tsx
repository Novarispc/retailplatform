"use client";

import { useActionState, useState } from "react";
import { updateThemeColorsAction } from "@/server/actions/store";
import type { ThemeColors } from "@/server/services/store";
import { ColorField, type PreviewKind } from "@/components/ui/color-field";

// ── Preset palettes ─────────────────────────────────────────────────────────
const PRESETS: { name: string; colors: Required<ThemeColors> }[] = [
  {
    name: "Nova Red (Default)",
    colors: { accent: "#e8001d", accent2: "#ff4444", accent3: "#ff8c00", background: "#06070d", surface: "#0c0e18", surface2: "#11141f", surface3: "#161a28", foreground: "#eef0f6", muted: "#9aa3b8", border: "#1e2233" },
  },
  {
    name: "Royal Blue",
    colors: { accent: "#2563eb", accent2: "#3b82f6", accent3: "#60a5fa", background: "#04060f", surface: "#080d1c", surface2: "#0d1426", surface3: "#121b33", foreground: "#e8edf8", muted: "#8896b3", border: "#1a2340" },
  },
  {
    name: "Emerald",
    colors: { accent: "#10b981", accent2: "#34d399", accent3: "#6ee7b7", background: "#030d0a", surface: "#071410", surface2: "#0b1e17", surface3: "#10281f", foreground: "#e6f5ef", muted: "#7fb39e", border: "#133326" },
  },
  {
    name: "Purple Haze",
    colors: { accent: "#7c3aed", accent2: "#a855f7", accent3: "#c084fc", background: "#07050f", surface: "#0e0a1c", surface2: "#150f28", surface3: "#1b1433", foreground: "#ede8f8", muted: "#9888c4", border: "#261d40" },
  },
  {
    name: "Golden Hour",
    colors: { accent: "#d97706", accent2: "#f59e0b", accent3: "#fcd34d", background: "#080600", surface: "#150f01", surface2: "#1e1602", surface3: "#271d03", foreground: "#faf5e4", muted: "#b5a06a", border: "#352800" },
  },
  {
    name: "Rose Gold",
    colors: { accent: "#e11d48", accent2: "#fb7185", accent3: "#fda4af", background: "#0f0508", surface: "#1a0810", surface2: "#240b18", surface3: "#2e0e20", foreground: "#fde8ee", muted: "#c48a97", border: "#3d1021" },
  },
  {
    name: "Cyber Teal",
    colors: { accent: "#0ea5e9", accent2: "#38bdf8", accent3: "#7dd3fc", background: "#030a0f", surface: "#071320", surface2: "#0c1c2e", surface3: "#10253d", foreground: "#e0f2fe", muted: "#7aaccc", border: "#163452" },
  },
  {
    name: "Carbon",
    colors: { accent: "#64748b", accent2: "#94a3b8", accent3: "#cbd5e1", background: "#030303", surface: "#0a0a0a", surface2: "#111111", surface3: "#191919", foreground: "#f0f0f0", muted: "#888888", border: "#222222" },
  },
  {
    name: "Forest",
    colors: { accent: "#16a34a", accent2: "#22c55e", accent3: "#4ade80", background: "#030b04", surface: "#061308", surface2: "#0a1c0c", surface3: "#0e2610", foreground: "#e6f4ea", muted: "#7ba882", border: "#143d18" },
  },
  {
    name: "Midnight",
    colors: { accent: "#6366f1", accent2: "#818cf8", accent3: "#a5b4fc", background: "#050509", surface: "#09091a", surface2: "#0e0e24", surface3: "#14142e", foreground: "#e8e8f8", muted: "#8888bb", border: "#1e1e3a" },
  },
];

const COLOR_FIELDS: {
  key: keyof ThemeColors;
  label: string;
  hint: string;
  preview: PreviewKind;
  pairedKey?: keyof ThemeColors;
}[] = [
  { key: "accent",     label: "Primary Accent",    hint: "Brand color, CTAs, buttons",          preview: "solidButton" },
  { key: "accent2",    label: "Accent 2",           hint: "Hover states, secondary highlights",  preview: "accentText" },
  { key: "accent3",    label: "Accent 3",           hint: "Gradients, badges, warm highlights",  preview: "gradientBadge", pairedKey: "accent" },
  { key: "background", label: "Page Background",    hint: "Deepest background layer",            preview: "pageBg" },
  { key: "surface",    label: "Surface",            hint: "Card / panel background",             preview: "surface" },
  { key: "surface2",   label: "Surface 2",          hint: "Elevated surfaces, modals",           preview: "elevatedSurface" },
  { key: "surface3",   label: "Surface 3",          hint: "Highest elevation, dropdowns",        preview: "topSurface" },
  { key: "foreground", label: "Foreground",         hint: "Primary headings & body text",        preview: "bodyText" },
  { key: "muted",      label: "Muted Text",         hint: "Secondary / caption text",            preview: "mutedText" },
  { key: "border",     label: "Border",             hint: "Dividers, input outlines",            preview: "borderInput" },
];

const DEFAULTS: Required<ThemeColors> = PRESETS[0].colors;

type Props = { initial: ThemeColors };

export function ThemeColorsForm({ initial }: Props) {
  const [colors, setColors] = useState<Required<ThemeColors>>({ ...DEFAULTS, ...initial });
  const [state, action, pending] = useActionState(updateThemeColorsAction, null);

  function applyPreset(preset: (typeof PRESETS)[0]) {
    setColors(preset.colors);
  }

  function setColor(key: keyof ThemeColors, val: string) {
    setColors((c) => ({ ...c, [key]: val }));
  }

  return (
    <form action={action} className="space-y-8">
      {/* Hidden inputs — always send current colors */}
      {COLOR_FIELDS.map(({ key }) => (
        <input key={key} type="hidden" name={key} value={colors[key] ?? DEFAULTS[key]} />
      ))}

      {/* Presets */}
      <div>
        <p className="mb-3 text-sm font-medium">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-foreground"
            >
              <span className="h-3 w-3 rounded-full ring-1 ring-white/10" style={{ background: p.colors.accent }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live palette preview bar */}
      <div
        className="flex flex-wrap gap-3 rounded-2xl border p-4"
        style={{ background: colors.background, borderColor: colors.border }}
      >
        {(["accent", "accent2", "accent3", "surface", "surface2", "surface3", "foreground", "muted", "border"] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <span className="h-8 w-8 rounded-full ring-1 ring-white/10" style={{ background: colors[k] ?? DEFAULTS[k] }} />
            <span className="text-[9px] font-mono" style={{ color: colors.foreground, opacity: 0.5 }}>{k}</span>
          </div>
        ))}
        <div
          className="ml-auto flex items-center gap-2 self-center rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: colors.accent, color: colors.background }}
        >
          Preview button
        </div>
      </div>

      {/* Individual color pickers with live previews */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
        {COLOR_FIELDS.map(({ key, label, hint, preview, pairedKey }) => (
          <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <ColorField
              label={label}
              name={`_display_${key}`}
              value={colors[key] ?? DEFAULTS[key]}
              hint={hint}
              preview={preview}
              pairedValue={pairedKey ? colors[pairedKey] : undefined}
              onChange={(val) => setColor(key, val)}
            />
          </div>
        ))}
      </div>

      {state && "error" in state && state.error && (
        <p className="rounded-lg bg-[var(--danger)]/10 px-4 py-2 text-sm text-[var(--danger)]">{state.error}</p>
      )}
      {state && "ok" in state && state.ok && (
        <p className="rounded-lg bg-[var(--success)]/10 px-4 py-2 text-sm text-[var(--success)]">Theme colors saved!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save theme colors"}
      </button>
    </form>
  );
}
