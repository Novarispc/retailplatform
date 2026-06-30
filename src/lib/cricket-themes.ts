// ─────────────────────────────────────────────────────────────
// Cricket Theme Engine — premium sports identities for ASPORTS ZONE.
// DARK mode = the team's PRIMARY colour as the page background, SECONDARY as
// accent (buttons / price / highlights), plus a glowing centre tagline.
// LIGHT mode keeps the refined neutral palettes (unchanged).
// No motion — visual excellence through colour, depth and composition only.
// ─────────────────────────────────────────────────────────────

export type ThemeMode = "dark" | "light";

export type Palette = {
  accent: string;
  accent2: string;
  accent3: string;
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  foreground: string;
  muted: string;
  border: string;
  borderStrong: string;
  onAccent: string;
};

export type ThemeModeStyle = {
  palette: Palette;
  background: string; // layered CSS for the fixed .aurora-bg::before plate
};

export type CricketTheme = {
  slug: string;
  name: string;
  short: string;
  category: "international" | "ipl";
  description: string;
  tagline: string;          // centre watermark text (editable per theme)
  previewGradient: string;
  dark: ThemeModeStyle;
  light: ThemeModeStyle;
};

// ── Colour utilities ──────────────────────────────────────────
function hx(h: string): [number, number, number] {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function toHex(rgb: number[]): string {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function mix(a: string, b: string, t: number): string {
  const A = hx(a), B = hx(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}
function relLum(h: string): number {
  const c = hx(h).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
// Black wins over white once a colour's luminance exceeds ~0.18 (the point where
// the two contrast ratios cross), so that's the threshold for on-colour text.
function idealText(bg: string): string {
  return relLum(bg) > 0.18 ? "#100f08" : "#ffffff";
}

// DARK branded palette: PRIMARY drives the background, SECONDARY the accents.
function brandedDark(primary: string, accent: string, accent2: string, accent3: string): Palette {
  const lightBg = relLum(primary) > 0.20;
  const fg = lightBg ? "#0d0d11" : "#ffffff";
  return {
    accent, accent2, accent3,
    background: primary,
    surface:  lightBg ? mix(primary, "#ffffff", 0.74) : mix(primary, "#000000", 0.30),
    surface2: lightBg ? mix(primary, "#ffffff", 0.60) : mix(primary, "#000000", 0.42),
    surface3: lightBg ? mix(primary, "#ffffff", 0.46) : mix(primary, "#000000", 0.52),
    foreground: fg,
    muted: lightBg ? mix("#0b0b0e", primary, 0.28) : mix("#ffffff", primary, 0.26),
    border:       lightBg ? mix(primary, "#000000", 0.18) : mix(primary, "#ffffff", 0.16),
    borderStrong: lightBg ? mix(primary, "#000000", 0.30) : mix(primary, "#ffffff", 0.28),
    onAccent: idealText(accent),
  };
}

// DARK cinematic plate over the primary-colour background: secondary glints in
// the top corners + a soft floor vignette for depth.
function brandedPlate(primary: string, accent: string): string {
  const v = relLum(primary) > 0.20 ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.42)";
  return [
    `radial-gradient(60% 60% at 14% -6%, ${accent}3a, transparent 60%)`,
    `radial-gradient(55% 55% at 92% 0%, ${accent}2c, transparent 62%)`,
    `radial-gradient(95% 70% at 50% 126%, ${v}, transparent 72%)`,
    `linear-gradient(180deg, transparent 52%, ${v})`,
  ].join(", ");
}

function dk(primary: string, accent: string, accent2: string, accent3: string): ThemeModeStyle {
  return { palette: brandedDark(primary, accent, accent2, accent3), background: brandedPlate(primary, accent) };
}

// LIGHT plate (unchanged behaviour).
function cinematic(c1: string, c2: string, c3: string): string {
  return [
    `radial-gradient(55% 60% at 12% 8%, ${c1}1f, transparent 70%)`,
    `radial-gradient(50% 55% at 88% 4%, ${c2}1a, transparent 72%)`,
    `radial-gradient(70% 55% at 50% 120%, ${c1}14, transparent 74%)`,
    `linear-gradient(118deg, transparent 40%, ${c3}10 50%, transparent 62%)`,
  ].join(", ");
}

export function crestSvg(c1: string, c2: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
<circle cx="100" cy="100" r="94" stroke="${c1}" stroke-width="3"/>
<circle cx="100" cy="100" r="82" stroke="${c1}" stroke-width="1.2" opacity="0.55"/>
<g stroke="${c1}" stroke-width="7" stroke-linecap="round"><path d="M64 142 L128 60"/><path d="M136 142 L72 60"/></g>
<g fill="${c1}"><rect x="59" y="138" width="12" height="20" rx="4" transform="rotate(-38 65 148)"/><rect x="129" y="138" width="12" height="20" rx="4" transform="rotate(38 135 148)"/></g>
<circle cx="100" cy="58" r="11" fill="${c2}"/>
<g stroke="${c2}" stroke-width="4" stroke-linecap="round"><path d="M88 150 L88 170"/><path d="M100 150 L100 170"/><path d="M112 150 L112 170"/></g>
<path d="M100 14 l4 8 9 1 -6 6 1.5 9 -8.5 -4.5 -8.5 4.5 1.5 -9 -6 -6 9 -1 z" fill="${c2}"/>
</svg>`;
}
export function crestDataUri(c1: string, c2: string): string {
  return `data:image/svg+xml,${encodeURIComponent(crestSvg(c1, c2))}`;
}

// ── Theme definitions ─────────────────────────────────────────
export const CRICKET_THEMES: CricketTheme[] = [
  {
    slug: "default", name: "ASPORTS ZONE", short: "Default", category: "international",
    description: "House brand — matte black, electric yellow, emerald turf and metallic gold.",
    tagline: "United by Cricket",
    previewGradient: "linear-gradient(135deg, #0b0d10 0%, #f7e600 60%, #3fa34d 100%)",
    dark: {
      palette: {
        accent: "#f7e600", accent2: "#c8a24c", accent3: "#3fa34d",
        background: "#0b0d10", surface: "#181c22", surface2: "#20252e", surface3: "#283039",
        foreground: "#f8fafc", muted: "#9aa3b0", border: "#262c35", borderStrong: "#353d49",
        onAccent: "#0b0d10",
      },
      background: "radial-gradient(58% 60% at 13% -4%, #f7e60026, transparent 62%), radial-gradient(55% 55% at 90% 0%, #3fa34d22, transparent 64%), radial-gradient(95% 70% at 50% 126%, rgba(0,0,0,0.42), transparent 72%), linear-gradient(180deg, transparent 54%, rgba(0,0,0,0.42))",
    },
    light: {
      palette: {
        accent: "#2f7d3a", accent2: "#9a7b2e", accent3: "#c8a24c",
        background: "#f5f6f2", surface: "#ffffff", surface2: "#eef0ea", surface3: "#e4e7dd",
        foreground: "#0b0d10", muted: "#565d63", border: "#e3e5dd", borderStrong: "#ced2c5",
        onAccent: "#ffffff",
      },
      background: cinematic("#2f7d3a", "#c8a24c", "#3fa34d"),
    },
  },

  // ── International ──
  {
    slug: "team-india", name: "Team India", short: "India", category: "international",
    description: "The Men in Blue — royal blue with saffron pride.",
    tagline: "Bleed Blue",
    previewGradient: "linear-gradient(135deg, #0a3b9e 0%, #1a73e8 55%, #ff9933 100%)",
    dark: dk("#0a3b9e", "#ff9933", "#ffffff", "#5b86e0"),
    light: {
      palette: { accent: "#1559c4", accent2: "#e07b00", accent3: "#1559c4", background: "#f3f6fd", surface: "#ffffff", surface2: "#eef3fb", surface3: "#e3ebf7", foreground: "#0a142e", muted: "#5a6a8a", border: "#d4ddee", borderStrong: "#bccae3", onAccent: "#ffffff" },
      background: cinematic("#1559c4", "#e07b00", "#1559c4"),
    },
  },
  {
    slug: "icc-wc-odi", name: "ICC World Cup (ODI)", short: "WC50", category: "international",
    description: "The 50-over showpiece — championship blue and trophy gold.",
    tagline: "Champions of the World",
    previewGradient: "linear-gradient(135deg, #123a86 0%, #2b8aff 55%, #e6b84a 100%)",
    dark: dk("#123a86", "#e6b84a", "#ffffff", "#5b86e0"),
    light: {
      palette: { accent: "#1559c4", accent2: "#b8901f", accent3: "#1559c4", background: "#f2f7fd", surface: "#ffffff", surface2: "#e9f1fb", surface3: "#dce8f6", foreground: "#06152e", muted: "#56698a", border: "#d3e0f0", borderStrong: "#bdcfe8", onAccent: "#ffffff" },
      background: cinematic("#1559c4", "#b8901f", "#1559c4"),
    },
  },
  {
    slug: "icc-wc-t20", name: "ICC T20 World Cup", short: "WC20", category: "international",
    description: "Fast, fearless, electric — electric purple with cyan and pink.",
    tagline: "Fastest Format, Fiercest Fans",
    previewGradient: "linear-gradient(135deg, #7b2ff0 0%, #17c3e0 55%, #ff4fa3 100%)",
    dark: dk("#7b2ff0", "#17c3e0", "#ff4fa3", "#b98cff"),
    light: {
      palette: { accent: "#07786c", accent2: "#d9560a", accent3: "#088f82", background: "#f0fbf9", surface: "#ffffff", surface2: "#e3f5f1", surface3: "#d3ede7", foreground: "#062420", muted: "#4f857c", border: "#cfeae4", borderStrong: "#b6ddd4", onAccent: "#ffffff" },
      background: cinematic("#088f82", "#d9560a", "#088f82"),
    },
  },
  {
    slug: "wtc", name: "World Test Championship", short: "WTC", category: "international",
    description: "Cricket's ultimate prestige — heritage forest green and mace gold.",
    tagline: "The Ultimate Test",
    previewGradient: "linear-gradient(135deg, #0f5a34 0%, #1f9d5e 55%, #d4af37 100%)",
    dark: dk("#0f5a34", "#d4af37", "#ffffff", "#4cae7e"),
    light: {
      palette: { accent: "#157a47", accent2: "#9c7c1a", accent3: "#157a47", background: "#f1faf4", surface: "#ffffff", surface2: "#e6f4ec", surface3: "#d6ebde", foreground: "#06241a", muted: "#4f8468", border: "#cfe8d8", borderStrong: "#b6ddc4", onAccent: "#ffffff" },
      background: cinematic("#157a47", "#9c7c1a", "#157a47"),
    },
  },
  {
    slug: "womens-cricket", name: "Women's Cricket", short: "WMN", category: "international",
    description: "Bold and brilliant — vibrant pink with regal purple.",
    tagline: "Game Changers",
    previewGradient: "linear-gradient(135deg, #e0349a 0%, #ff7ac8 45%, #8e2db5 100%)",
    dark: dk("#e0349a", "#8e2db5", "#ffffff", "#ff86c8"),
    light: {
      palette: { accent: "#c01484", accent2: "#0d8c7e", accent3: "#c01484", background: "#fdf2f9", surface: "#ffffff", surface2: "#fbe9f4", surface3: "#f6dcee", foreground: "#2a061f", muted: "#8a5a7c", border: "#f0d4e7", borderStrong: "#e6bfd9", onAccent: "#ffffff" },
      background: cinematic("#c01484", "#0d8c7e", "#c01484"),
    },
  },

  // ── IPL franchises (DARK: primary bg, secondary accent) ──
  {
    slug: "rcb", name: "Royal Challengers Bengaluru", short: "RCB", category: "ipl",
    description: "RCB red with gold — luxury, power and championship swagger.",
    tagline: "Dare to Dominate",
    previewGradient: "linear-gradient(135deg, #0a0406 0%, #d71920 60%, #e2b53c 100%)",
    dark: dk("#d71920", "#e2b53c", "#111111", "#ff5566"),
    light: {
      palette: { accent: "#c0102a", accent2: "#9c7c1a", accent3: "#c0102a", background: "#faf5f3", surface: "#ffffff", surface2: "#f6ecec", surface3: "#efe0e1", foreground: "#1a0608", muted: "#7a5a5e", border: "#ecd9db", borderStrong: "#e0c4c7", onAccent: "#ffffff" },
      background: cinematic("#c0102a", "#9c7c1a", "#c0102a"),
    },
  },
  {
    slug: "csk", name: "Chennai Super Kings", short: "CSK", category: "ipl",
    description: "CSK yellow with royal blue — iconic, bold and electric.",
    tagline: "Roar in Yellow",
    previewGradient: "linear-gradient(135deg, #f9d000 0%, #f4c400 52%, #0057b8 100%)",
    dark: dk("#f9d000", "#0057b8", "#f26b21", "#2a7fd6"),
    light: {
      palette: { accent: "#b98700", accent2: "#1d3f8f", accent3: "#1d3f8f", background: "#fffdf3", surface: "#ffffff", surface2: "#fbf4dd", surface3: "#f4ead0", foreground: "#10182e", muted: "#5d6a86", border: "#ece2c4", borderStrong: "#e0d3ad", onAccent: "#1a1200" },
      background: cinematic("#b98700", "#1d3f8f", "#1d3f8f"),
    },
  },
  {
    slug: "mi", name: "Mumbai Indians", short: "MI", category: "ipl",
    description: "MI royal blue with gold — elite, premium and dominant.",
    tagline: "Born to Rule",
    previewGradient: "linear-gradient(135deg, #004ba0 0%, #0a5fc2 55%, #d4af37 100%)",
    dark: dk("#004ba0", "#d4af37", "#ffd24a", "#4aa3ff"),
    light: {
      palette: { accent: "#0a4ea0", accent2: "#a8841c", accent3: "#0a4ea0", background: "#f2f7fe", surface: "#ffffff", surface2: "#e9f1fc", surface3: "#dde9f8", foreground: "#061634", muted: "#566889", border: "#d3e0f2", borderStrong: "#bdd0eb", onAccent: "#ffffff" },
      background: cinematic("#0a4ea0", "#a8841c", "#0a4ea0"),
    },
  },
  {
    slug: "rr", name: "Rajasthan Royals", short: "RR", category: "ipl",
    description: "RR pink with royal navy — modern, fearless and united.",
    tagline: "Royal. Fearless. United.",
    previewGradient: "linear-gradient(135deg, #ff4fa3 0%, #ff7ac2 45%, #002d72 100%)",
    dark: dk("#ff4fa3", "#002d72", "#ffffff", "#ff86c8"),
    light: {
      palette: { accent: "#c01477", accent2: "#1a4aa0", accent3: "#c01477", background: "#fdf2f8", surface: "#ffffff", surface2: "#fbe9f3", surface3: "#f6dcec", foreground: "#2a061b", muted: "#8a5a76", border: "#f0d4e4", borderStrong: "#e6bfd5", onAccent: "#ffffff" },
      background: cinematic("#c01477", "#1a4aa0", "#c01477"),
    },
  },
  {
    slug: "kkr", name: "Kolkata Knight Riders", short: "KKR", category: "ipl",
    description: "KKR purple with gold — royal, regal and commanding.",
    tagline: "Fight. Rise. Reign.",
    previewGradient: "linear-gradient(135deg, #3a225d 0%, #5a259e 55%, #c9a227 100%)",
    dark: dk("#3a225d", "#c9a227", "#ede7d9", "#b18bff"),
    light: {
      palette: { accent: "#5a259e", accent2: "#9c7c1a", accent3: "#5a259e", background: "#f7f3fd", surface: "#ffffff", surface2: "#efe8fb", surface3: "#e6daf7", foreground: "#160a2e", muted: "#6a5a8a", border: "#e0d4f2", borderStrong: "#cdbceb", onAccent: "#ffffff" },
      background: cinematic("#5a259e", "#9c7c1a", "#5a259e"),
    },
  },
  {
    slug: "gt", name: "Gujarat Titans", short: "GT", category: "ipl",
    description: "GT navy with gold — futuristic, sleek and precise.",
    tagline: "Built to Conquer",
    previewGradient: "linear-gradient(135deg, #1b2a49 0%, #2b3f63 55%, #c8a44d 100%)",
    dark: dk("#1b2a49", "#c8a44d", "#ffffff", "#5b86e0"),
    light: {
      palette: { accent: "#1f5fd6", accent2: "#5f7184", accent3: "#1f5fd6", background: "#f3f6fb", surface: "#ffffff", surface2: "#eaf0f7", surface3: "#dde6f1", foreground: "#0a1626", muted: "#56697f", border: "#d5e0ee", borderStrong: "#bfcee2", onAccent: "#ffffff" },
      background: cinematic("#1f5fd6", "#5f7184", "#1f5fd6"),
    },
  },
  {
    slug: "lsg", name: "Lucknow Super Giants", short: "LSG", category: "ipl",
    description: "LSG cyan with energetic orange — clean, fresh and electric.",
    tagline: "Beyond the Boundary",
    previewGradient: "linear-gradient(135deg, #5bc0eb 0%, #2ea6d6 55%, #f58220 100%)",
    dark: dk("#5bc0eb", "#c75e0e", "#0a2a5e", "#2ea6d6"),
    light: {
      palette: { accent: "#066f88", accent2: "#d9560a", accent3: "#0892b0", background: "#f0fafc", surface: "#ffffff", surface2: "#e3f4f8", surface3: "#d3ecf2", foreground: "#062029", muted: "#4f7884", border: "#cfe9f0", borderStrong: "#b6dde7", onAccent: "#ffffff" },
      background: cinematic("#0892b0", "#d9560a", "#0892b0"),
    },
  },
  {
    slug: "pbks", name: "Punjab Kings", short: "PBKS", category: "ipl",
    description: "PBKS red with brushed silver and gold — aggressive and proud.",
    tagline: "Rule with Pride",
    previewGradient: "linear-gradient(135deg, #d71920 0%, #b81322 55%, #c0c0c0 100%)",
    dark: dk("#d71920", "#cfd3d8", "#c9a227", "#ff5a66"),
    light: {
      palette: { accent: "#b81322", accent2: "#5f6b78", accent3: "#b81322", background: "#fdf2f3", surface: "#ffffff", surface2: "#f8e8ea", surface3: "#f2dadd", foreground: "#2a060a", muted: "#8a585e", border: "#f0d4d8", borderStrong: "#e6bfc4", onAccent: "#ffffff" },
      background: cinematic("#b81322", "#5f6b78", "#b81322"),
    },
  },
  {
    slug: "srh", name: "Sunrisers Hyderabad", short: "SRH", category: "ipl",
    description: "SRH fiery orange with jet black — intense and relentless.",
    tagline: "Rise with Fire",
    previewGradient: "linear-gradient(135deg, #f26b21 0%, #ff8a3d 50%, #111111 100%)",
    dark: dk("#f26b21", "#141414", "#ffc046", "#ff9d57"),
    light: {
      palette: { accent: "#bf4906", accent2: "#1a1a1a", accent3: "#d9560a", background: "#fff6f0", surface: "#ffffff", surface2: "#fceadd", surface3: "#f6dcca", foreground: "#1f0e02", muted: "#846552", border: "#f0d9c7", borderStrong: "#e6c5aa", onAccent: "#ffffff" },
      background: cinematic("#d9560a", "#1a1a1a", "#d9560a"),
    },
  },
  {
    slug: "dc", name: "Delhi Capitals", short: "DC", category: "ipl",
    description: "DC blue with bold red — dynamic, sharp and spirited.",
    tagline: "Capital of Courage",
    previewGradient: "linear-gradient(135deg, #004c97 0%, #1a73e8 55%, #e31b23 100%)",
    dark: dk("#004c97", "#fb4d55", "#ffffff", "#3b82f6"),
    light: {
      palette: { accent: "#1a4fb8", accent2: "#cc1822", accent3: "#1a4fb8", background: "#f2f6fd", surface: "#ffffff", surface2: "#e9f1fc", surface3: "#dde9f8", foreground: "#061634", muted: "#566889", border: "#d3e0f2", borderStrong: "#bdd0eb", onAccent: "#ffffff" },
      background: cinematic("#1a4fb8", "#cc1822", "#1a4fb8"),
    },
  },
];

export function getCricketTheme(slug: string): CricketTheme {
  return CRICKET_THEMES.find((t) => t.slug === slug) ?? CRICKET_THEMES[0];
}

// ── Config (stored in StoreSettings.themeJson.cricket) ────────
export type CricketThemeConfig = {
  activeSlug: string;
  mode: ThemeMode;
  scheduledSlug: string;
  scheduledStart: string;
  scheduledEnd: string;
  taglines: Record<string, string>; // per-slug tagline overrides
};

export const DEFAULT_CRICKET_CONFIG: CricketThemeConfig = {
  activeSlug: "default",
  mode: "dark",
  scheduledSlug: "",
  scheduledStart: "",
  scheduledEnd: "",
  taglines: {},
};

export function resolveActiveCricketTheme(cfg: CricketThemeConfig, now: Date): CricketTheme {
  const { scheduledSlug, scheduledStart, scheduledEnd, activeSlug } = cfg;
  if (scheduledSlug && scheduledStart && scheduledEnd) {
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    end.setHours(23, 59, 59, 999);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) {
      return getCricketTheme(scheduledSlug);
    }
  }
  if (activeSlug && activeSlug !== "default") return getCricketTheme(activeSlug);
  return getCricketTheme("default");
}

// Resolve the tagline shown for a theme (admin override wins over the default).
export function resolveTagline(cfg: CricketThemeConfig, theme: CricketTheme): string {
  return (cfg.taglines?.[theme.slug]?.trim() || theme.tagline || "United by Cricket");
}

// Build the CSS for ONE mode of a theme, scoped under html[data-mode="<mode>"]
// so the active mode is chosen by the visitor at runtime (no refresh, no admin
// involvement): palette vars, cinematic plate and the glowing centre tagline.
function buildModeCss(theme: CricketTheme, mode: ThemeMode): string {
  const style = theme[mode];
  if (!style.palette) return "";
  const p = style.palette;
  const scope = `html[data-mode="${mode}"]`;
  const root = [
    `--background:${p.background};`,
    `--surface:${p.surface};`,
    `--surface-2:${p.surface2};`,
    `--surface-3:${p.surface3};`,
    `--foreground:${p.foreground};`,
    `--muted:${p.muted};`,
    `--border:${p.border};`,
    `--border-strong:${p.borderStrong};`,
    `--accent:${p.accent};--ring:${p.accent};--energy:${p.accent};`,
    `--accent-2:${p.accent2};`,
    `--accent-3:${p.accent3};`,
    `--on-accent:${p.onAccent};`,
    `color-scheme:${mode};`,
  ].join("");

  // Premium centre tagline watermark (both modes). The glyphs are filled with a
  // soft secondary→tertiary→secondary gradient; a layered drop-shadow adds an
  // outer secondary glow, a tertiary bloom and a gentle floating projection.
  // A blend mode lets it sit inside the background instead of on top of it.
  const grad = `linear-gradient(120deg, ${p.accent} 0%, ${p.accent3} 52%, ${p.accent} 100%)`;
  const glow = mode === "dark"
    ? `drop-shadow(0 0 30px ${p.accent}59) drop-shadow(0 0 64px ${p.accent3}3d) drop-shadow(0 12px 24px rgba(0,0,0,0.42))`
    : `drop-shadow(0 0 22px ${p.accent}4d) drop-shadow(0 0 50px ${p.accent3}33) drop-shadow(0 10px 20px rgba(0,0,0,0.16))`;
  const tagline =
    `${scope} .cricket-tagline{position:fixed;inset:0;z-index:-1;display:flex;align-items:center;justify-content:center;` +
    `text-align:center;padding:0 6vw;font-family:var(--font-display),sans-serif;font-weight:800;` +
    `font-size:clamp(2.4rem,7.6vw,6.6rem);line-height:1.04;letter-spacing:-0.02em;text-transform:uppercase;` +
    `background-image:${grad};-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;` +
    `filter:${glow};` +
    `opacity:${mode === "dark" ? "0.34" : "0.24"};` +
    `mix-blend-mode:${mode === "dark" ? "screen" : "multiply"};` +
    `pointer-events:none;user-select:none;}`;

  return [
    `${scope}{${root}}`,
    `${scope} .aurora-bg::before{background:${style.background} !important;filter:blur(40px) !important;height:100vh !important;opacity:1 !important;}`,
    tagline,
  ].join("\n");
}

// Build the injectable CSS for a theme covering BOTH dark and light modes. The
// active mode is selected by the html[data-mode] attribute, set per visitor
// (cookie + localStorage) — so the admin-chosen team theme adapts to whichever
// mode the visitor prefers. Example: admin picks RCB → a visitor in light mode
// sees the RCB light variant, a visitor in dark mode sees the RCB dark variant.
export function buildCricketThemeCss(theme: CricketTheme): string {
  return [buildModeCss(theme, "dark"), buildModeCss(theme, "light")].filter(Boolean).join("\n");
}
