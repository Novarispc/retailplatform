export const dynamic = "force-dynamic";
import { Trophy, Moon, Sun } from "lucide-react";
import { getCricketConfig } from "@/server/services/store";
import { CRICKET_THEMES, type ThemeMode } from "@/lib/cricket-themes";
import {
  activateCricketThemeAction,
  setCricketModeAction,
  saveCricketScheduleAction,
  clearCricketScheduleAction,
  setCricketTaglineAction,
} from "@/server/actions/store";
import { getCricketTheme, resolveTagline } from "@/lib/cricket-themes";

export const metadata = { title: "Cricket Themes · Admin", robots: { index: false } };

function Swatch({ color, label }: { color?: string; label: string }) {
  if (!color) return null;
  return (
    <span
      title={label}
      className="inline-block h-5 w-5 shrink-0 rounded-full border border-white/15"
      style={{ background: color }}
    />
  );
}

export default async function AdminThemesPage() {
  const cfg = await getCricketConfig();
  const activeSlug = cfg.activeSlug || "default";
  const mode: ThemeMode = cfg.mode === "light" ? "light" : "dark";

  const international = CRICKET_THEMES.filter((t) => t.category === "international");
  const ipl = CRICKET_THEMES.filter((t) => t.category === "ipl");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Trophy className="h-7 w-7 text-[var(--accent)]" /> Cricket Themes
        </h1>
        <p className="text-muted">
          Premium team identities — palette, cinematic background and embedded crest applied
          sitewide. Pick a light or dark variant, or schedule a theme for a date range.
        </p>
      </div>

      {/* Mode toggle + schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="text-sm font-semibold">Appearance</p>
            <p className="mt-0.5 text-xs text-muted">Dark or light variant of the active theme</p>
          </div>
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((m) => (
              <form
                key={m}
                action={async () => {
                  "use server";
                  await setCricketModeAction(m);
                }}
              >
                <button
                  type="submit"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === m
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] text-muted hover:text-foreground"
                  }`}
                >
                  {m === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  {m === "dark" ? "Dark" : "Light"}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div className="glass flex flex-col gap-3 rounded-2xl p-5">
          <p className="text-sm font-semibold">Auto-Schedule</p>
          <form action={saveCricketScheduleAction} className="flex flex-col gap-3">
            <select
              name="scheduledSlug"
              defaultValue={cfg.scheduledSlug}
              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">— none —</option>
              {CRICKET_THEMES.filter((t) => t.slug !== "default").map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" name="scheduledStart" defaultValue={cfg.scheduledStart}
                className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none" />
              <input type="date" name="scheduledEnd" defaultValue={cfg.scheduledEnd}
                className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-[var(--accent)] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
              Save Schedule
            </button>
          </form>
          <form action={clearCricketScheduleAction}>
            <button type="submit" className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-muted transition-colors hover:bg-[var(--surface-2)]">
              Clear Schedule
            </button>
          </form>
        </div>
      </div>

      {/* Background tagline editor for the active theme (shown as the dark-mode centre watermark) */}
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-semibold">Background Tagline</p>
        <p className="mt-0.5 mb-3 text-xs text-muted">
          Centre watermark for <span className="font-semibold text-foreground">{getCricketTheme(activeSlug).name}</span> (shown in dark mode). Leave blank to use the default.
        </p>
        <form action={setCricketTaglineAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="slug" value={activeSlug} />
          <input
            name="tagline"
            defaultValue={resolveTagline(cfg, getCricketTheme(activeSlug))}
            maxLength={60}
            placeholder="United by Cricket"
            className="h-9 min-w-64 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--on-accent)] transition-opacity hover:opacity-90">
            Save Tagline
          </button>
        </form>
      </div>

      <ThemeGrid title="International" themes={international} activeSlug={activeSlug} mode={mode} />
      <ThemeGrid title="IPL Franchises" themes={ipl} activeSlug={activeSlug} mode={mode} />

      <p className="text-center text-xs text-muted">
        Activating instantly restyles the entire storefront — background, buttons, cards, navigation,
        forms, tables and accents. A scheduled theme overrides the active one during its date range.
      </p>
    </div>
  );
}

function ThemeGrid({
  title,
  themes,
  activeSlug,
  mode,
}: {
  title: string;
  themes: typeof CRICKET_THEMES;
  activeSlug: string;
  mode: ThemeMode;
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const isActive = activeSlug === theme.slug;
          const isDefault = theme.slug === "default";
          const pal = isDefault ? null : theme[mode].palette;
          return (
            <div
              key={theme.slug}
              className={`glass flex flex-col overflow-hidden rounded-2xl transition-all ${
                isActive ? "ring-2 ring-[var(--accent)]" : ""
              }`}
            >
              <div className="relative flex h-36 items-center justify-center" style={{ background: theme.previewGradient }}>
                {isActive && (
                  <span className="absolute right-2 top-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Active · {mode}
                  </span>
                )}
                <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">{theme.short}</span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold">{theme.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{theme.description}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {pal ? (
                    <>
                      <Swatch color={pal.accent} label="Accent" />
                      <Swatch color={pal.accent2} label="Accent 2" />
                      <Swatch color={pal.background} label="Background" />
                      <Swatch color={pal.surface} label="Surface" />
                    </>
                  ) : (
                    <span className="text-xs italic text-muted">Uses admin theme colors</span>
                  )}
                </div>

                <div className="mt-auto pt-2">
                  {isActive ? (
                    <form action={async () => { "use server"; await activateCricketThemeAction("default"); }}>
                      <button type="submit" disabled={isDefault}
                        className="w-full rounded-lg bg-[var(--surface-3)] py-2 text-xs font-semibold text-muted transition-colors hover:text-foreground disabled:opacity-50">
                        {isDefault ? "✓ Default" : "Deactivate"}
                      </button>
                    </form>
                  ) : (
                    <form action={async () => { "use server"; await activateCricketThemeAction(theme.slug); }}>
                      <button type="submit"
                        className="w-full rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                        {isDefault ? "Reset to Default" : "Activate →"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
