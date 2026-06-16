import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

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

export async function updateHeroSettings(settings: HeroSettings) {
  const store = await getStoreWithSettings();
  const themeJson = (store.settings?.themeJson ?? {}) as Record<string, unknown>;
  const existingHero = (themeJson.hero as HeroSettings) ?? {};
  const hero = {
    ...existingHero,
    ...settings,
    badges: settings.badges?.length ? settings.badges : existingHero.badges ?? [],
  };

  const nextThemeJson = { ...themeJson, hero };
  return prisma.storeSettings.upsert({
    where: { storeId: store.id },
    create: { storeId: store.id, themeJson: nextThemeJson },
    update: { themeJson: nextThemeJson },
  });
}
