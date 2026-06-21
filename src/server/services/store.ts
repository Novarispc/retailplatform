import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

export type ThemeColors = {
  accent?: string;        // primary CTA / brand color
  accent2?: string;       // hover / secondary accent
  accent3?: string;       // gradient end / warm accent
  background?: string;    // page background
  surface?: string;       // card / panel background
  surface2?: string;      // elevated surface
  surface3?: string;      // highest surface
  foreground?: string;    // primary text
  muted?: string;         // secondary text
  border?: string;        // default border
};

export type StoreProfile = {
  storeName?: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  phone?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  googleMapsUrl?: string;
  footerName?: string;
  footerAddress?: string;
};

export type HeroBadge = {
  title: string;
  subtitle: string;
};

export type HeroSettings = {
  titleA?: string;
  titleB?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  badges?: HeroBadge[];
  trendingSlugs?: string[];
};

async function getStoreWithSettings() {
  const tenant = await getActiveTenant();
  const store = await prisma.store.findFirst({
    where: { tenantId: tenant.id },
    include: { settings: true },
  });
  if (!store) throw new Error("Store not found for active tenant");
  return store;
}

export async function getHeroSettings(): Promise<HeroSettings> {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  return (themeJson.hero as HeroSettings) ?? {};
}

export async function getStoreProfile(): Promise<StoreProfile> {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  return (themeJson.profile as StoreProfile) ?? {};
}

export async function updateStoreProfile(profile: StoreProfile) {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  const existing = (themeJson.profile as StoreProfile) ?? {};
  const next = { ...existing, ...profile };
  const nextThemeJson = { ...themeJson, profile: next };
  return prisma.storeSettings.upsert({
    where: { storeId: store.id },
    create: { storeId: store.id, themeJson: nextThemeJson },
    update: { themeJson: nextThemeJson },
  });
}

export async function getThemeColors(): Promise<ThemeColors> {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  return (themeJson.colors as ThemeColors) ?? {};
}

export async function updateThemeColors(colors: ThemeColors) {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  const nextThemeJson = { ...themeJson, colors };
  return prisma.storeSettings.upsert({
    where: { storeId: store.id },
    create: { storeId: store.id, themeJson: nextThemeJson },
    update: { themeJson: nextThemeJson },
  });
}

export async function updateHeroSettings(settings: HeroSettings) {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  const existingHero = (themeJson.hero as HeroSettings) ?? {};
  const hero = {
    ...existingHero,
    ...settings,
    badges: settings.badges?.length ? settings.badges : existingHero.badges ?? [],
    trendingSlugs: settings.trendingSlugs ?? existingHero.trendingSlugs ?? [],
  };

  const nextThemeJson = { ...themeJson, hero };
  return prisma.storeSettings.upsert({
    where: { storeId: store.id },
    create: { storeId: store.id, themeJson: nextThemeJson },
    update: { themeJson: nextThemeJson },
  });
}
