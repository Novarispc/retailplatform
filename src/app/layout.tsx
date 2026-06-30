import type { Metadata } from "next";
import type { Viewport } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getCricketConfig, getStoreProfile, getThemeColors } from "@/server/services/store";
import { resolveActiveCricketTheme, buildCricketThemeCss, resolveTagline } from "@/lib/cricket-themes";
import { THEME_COOKIE, isThemeChoice, themeModeInitScript, type ResolvedMode } from "@/lib/theme-mode";

// Display / headings — editorial, premium, distinctive
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

// Body / UI — clean, modern, premium feel at all weights
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// Mono — prices, codes, data
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getStoreProfile().catch(() => ({}));
  const name = (profile as { storeName?: string }).storeName ?? "ASPORTS ZONE";
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: `${name} — Built for the Pitch`,
      template: `%s · ${name}`,
    },
    description:
      "From local nets to big matches — trusted cricket gear for every player",
    keywords: ["cricket equipment", "cricket bat", "cricket shoes", "sports accessories", "BDM cricket", "DSC cricket", "360 cricket", "Jodhpur cricket store"],
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — Built for the Pitch`,
      description: "From local nets to big matches — trusted cricket gear for every player",
      url: appUrl,
    },
    twitter: { card: "summary_large_image" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: name },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#06070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

function buildThemeStyle(
  base: Awaited<ReturnType<typeof getThemeColors>>,
  festival: Partial<Awaited<ReturnType<typeof getThemeColors>>> = {},
): string {
  // Festival overrides win over the admin-configured base palette while active.
  const colors = { ...base, ...festival };
  const vars: string[] = [];
  if (colors.accent)     vars.push(`--accent:${colors.accent};--ring:${colors.accent};--energy:${colors.accent};`);
  if (colors.accent2)    vars.push(`--accent-2:${colors.accent2};`);
  if (colors.accent3)    vars.push(`--accent-3:${colors.accent3};`);
  if (colors.background) vars.push(`--background:${colors.background};`);
  if (colors.surface)    vars.push(`--surface:${colors.surface};`);
  if (colors.surface2)   vars.push(`--surface-2:${colors.surface2};`);
  if (colors.surface3)   vars.push(`--surface-3:${colors.surface3};`);
  if (colors.foreground) vars.push(`--foreground:${colors.foreground};`);
  if (colors.muted)      vars.push(`--muted:${colors.muted};`);
  if (colors.border)     vars.push(`--border:${colors.border};`);
  // Admin custom colors apply to DARK mode only (light keeps the theme palette).
  return vars.length ? `html[data-mode="dark"]{${vars.join("")}}` : "";
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, themeColors, cricketCfg, jar] = await Promise.all([
    getLocale(),
    getThemeColors().catch(() => ({})),
    getCricketConfig().catch(() => null),
    cookies(),
  ]);
  // Admin chooses the team theme; the VISITOR chooses light/dark/system from the
  // header. The admin mode setting only seeds the server-side fallback used until
  // the pre-paint script resolves the visitor's stored choice.
  const fallbackMode: ResolvedMode = cricketCfg?.mode === "light" ? "light" : "dark";
  const stored = jar.get(THEME_COOKIE)?.value;
  const choice = isThemeChoice(stored) ? stored : "system";
  // "system" can't be resolved on the server; render the fallback — the inline
  // script corrects it before first paint.
  const initialMode: ResolvedMode = choice === "system" ? fallbackMode : choice;
  const cricket = cricketCfg ? resolveActiveCricketTheme(cricketCfg, new Date()) : null;
  const isDefault = !cricket || cricket.slug === "default";
  const tagline = cricket && cricketCfg ? resolveTagline(cricketCfg, cricket) : "";
  // Every theme (incl. the house default) injects BOTH dark + light palettes,
  // scoped under html[data-mode]; the active one follows the visitor's choice.
  // For the default theme we ALSO layer the admin-configured custom colors on top
  // (dark mode only — the Theme Colors panel still wins there).
  const cricketCss = cricket ? buildCricketThemeCss(cricket) : "";
  const themeStyle = isDefault ? buildThemeStyle(themeColors) : "";
  return (
    <html
      lang={locale}
      data-mode={initialMode}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${jakarta.variable} ${mono.variable} h-full antialiased`}
    >
      {/* Theme palette first; admin custom colors (default+dark) layered after so they win.
          precedence lets React 19 hoist these into <head> — a bare <style> under <html> is invalid. */}
      {cricketCss && (
        <style href="nova-cricket-theme" precedence="default">
          {cricketCss}
        </style>
      )}
      {themeStyle && (
        <style href="nova-theme-palette" precedence="default">
          {themeStyle}
        </style>
      )}
      <body className="aurora-bg flex min-h-full flex-col">
        {/* Pre-paint: resolve the visitor's stored light/dark/system choice and set
            html[data-mode] before content renders — kills any flash of wrong mode. */}
        <script dangerouslySetInnerHTML={{ __html: themeModeInitScript(fallbackMode) }} />
        {cricket && <div className="cricket-tagline" aria-hidden="true">{tagline}</div>}
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
