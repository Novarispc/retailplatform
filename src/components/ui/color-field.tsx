"use client";

const HEX = /^#[0-9a-fA-F]{6}$/;

export type PreviewKind =
  | "solidButton"
  | "accentText"
  | "gradientBadge"
  | "pageBg"
  | "surface"
  | "elevatedSurface"
  | "topSurface"
  | "bodyText"
  | "mutedText"
  | "borderInput";

const PREVIEW_LABEL: Record<PreviewKind, string> = {
  solidButton:     "Buttons & CTAs",
  accentText:      "Prices & links",
  gradientBadge:   "Badges & gradient",
  pageBg:          "Page background",
  surface:         "Cards & panels",
  elevatedSurface: "Modals & overlays",
  topSurface:      "Dropdowns & menus",
  bodyText:        "Headings & body text",
  mutedText:       "Captions & labels",
  borderInput:     "Inputs & dividers",
};

function Preview({ kind, color, paired }: { kind: PreviewKind; color: string; paired?: string }) {
  const mix = (pct: number, with_ = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${with_})`;
  const pair = HEX.test(paired ?? "") ? paired! : undefined;
  const darkSurface = "color-mix(in srgb, #fff 8%, transparent)";

  switch (kind) {
    case "solidButton":
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold text-white shadow"
            style={{ background: color }}>Add to cart</span>
          <span className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold text-white"
            style={{ background: `color-mix(in srgb, ${color} 78%, #fff)` }}>hover</span>
          <span className="inline-flex h-8 items-center rounded-full border px-4 text-xs font-semibold"
            style={{ borderColor: color, color }}>outline</span>
        </div>
      );

    case "accentText":
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold" style={{ color }}>₹2,499</span>
            <span className="text-[11px] text-muted line-through">₹3,999</span>
          </span>
          <span className="text-xs font-medium" style={{ color }}>★ 4.8 · view all</span>
        </div>
      );

    case "gradientBadge":
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${pair ?? color})` }}>HOT</span>
          <span className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold text-white"
            style={{ background: color }}>SALE</span>
          <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${color}, ${pair ?? color})` }} />
        </div>
      );

    case "pageBg":
      return (
        <div className="flex w-full flex-col gap-1.5 rounded-lg p-2" style={{ background: color }}>
          <div className="h-3 w-full rounded" style={{ background: mix(40, "#fff") }} />
          <div className="flex gap-1.5">
            <div className="h-10 flex-1 rounded border" style={{ background: mix(20, "#fff"), borderColor: mix(15, "#fff") }} />
            <div className="h-10 flex-1 rounded border" style={{ background: mix(20, "#fff"), borderColor: mix(15, "#fff") }} />
          </div>
        </div>
      );

    case "surface":
    case "elevatedSurface":
    case "topSurface":
      return (
        <div className="flex w-44 flex-col gap-1.5 rounded-lg border p-2 shadow-sm"
          style={{ background: color, borderColor: `color-mix(in srgb, ${color} 50%, #fff)` }}>
          <div className="h-10 rounded" style={{ background: darkSurface }} />
          <div className="h-2 w-3/4 rounded" style={{ background: darkSurface }} />
          <div className="h-2 w-1/2 rounded" style={{ background: darkSurface }} />
        </div>
      );

    case "bodyText":
      return (
        <div className="flex flex-col gap-0.5" style={{ color }}>
          <span className="text-sm font-bold">Futuristic retail, delivered</span>
          <span className="text-xs opacity-75">Premium sports & performance gear.</span>
        </div>
      );

    case "mutedText":
      return (
        <div className="flex flex-col gap-0.5" style={{ color }}>
          <span className="text-[11px] uppercase tracking-wide">Category · Brand</span>
          <span className="text-xs">Secondary caption · placeholder text</span>
        </div>
      );

    case "borderInput":
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-32 items-center rounded-lg border px-2.5 text-[11px] text-muted"
            style={{ borderColor: color }}>Search products…</span>
          <span className="inline-flex h-8 w-16 items-center justify-center rounded-lg border text-[11px] text-muted"
            style={{ borderColor: color }}>card</span>
        </div>
      );
  }
}

export function ColorField({
  label,
  name,
  value,
  hint,
  preview,
  pairedValue,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  hint?: string;
  preview?: PreviewKind;
  pairedValue?: string;
  onChange: (val: string) => void;
}) {
  const valid = HEX.test(value);
  const swatch = valid ? value : "#000000";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} swatch`}
          value={swatch}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-1"
        />
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          spellCheck={false}
          maxLength={7}
          className={`w-32 rounded-xl border bg-[var(--surface-2)] px-3 h-10 text-sm font-mono uppercase focus:border-[var(--accent)] focus:outline-none ${
            valid ? "border-[var(--border)]" : "border-[var(--danger)]/70"
          }`}
        />
        {!preview && (
          <span className="h-6 flex-1 rounded-md border border-[var(--border)]" style={{ background: swatch }} aria-hidden />
        )}
      </div>
      {preview && (
        <div className="mt-1 overflow-hidden rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between bg-[var(--surface-3)] px-2.5 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {PREVIEW_LABEL[preview]}
            </span>
            <span className="font-mono text-[10px] text-muted">{swatch.toUpperCase()}</span>
          </div>
          {/* checkerboard so light/white tints stay visible */}
          <div
            className="flex min-h-[3rem] items-center px-3 py-2.5"
            style={{
              backgroundColor: "#0c0e18",
              backgroundImage:
                "linear-gradient(45deg,#111420 25%,transparent 25%),linear-gradient(-45deg,#111420 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#111420 75%),linear-gradient(-45deg,transparent 75%,#111420 75%)",
              backgroundSize: "12px 12px",
              backgroundPosition: "0 0,0 6px,6px -6px,-6px 0px",
            }}
          >
            <Preview kind={preview} color={swatch} paired={pairedValue} />
          </div>
        </div>
      )}
    </div>
  );
}
