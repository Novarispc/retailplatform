"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { getCricketConfig, updateCricketConfig, updateHeroSettings, updateLoyaltySettings, updateStoreProfile, updateThemeColors } from "@/server/services/store";
import { getCricketTheme, type ThemeMode } from "@/lib/cricket-themes";
import { getStorage } from "@/lib/storage";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin");
  assert(session.user.role, "admin.access");
  return session.user;
}

export async function updateStoreProfileAction(_prev: unknown, formData: FormData) {
  await requireAdmin();

  try {
    const storeName     = String(formData.get("storeName")     ?? "").trim();
    const address       = String(formData.get("address")       ?? "").trim();
    const email         = String(formData.get("email")         ?? "").trim();
    const phone         = String(formData.get("phone")         ?? "").trim();
    const instagramUrl  = String(formData.get("instagramUrl")  ?? "").trim();
    const facebookUrl   = String(formData.get("facebookUrl")   ?? "").trim();
    const linkedinUrl   = String(formData.get("linkedinUrl")   ?? "").trim();
    const googleMapsUrl = String(formData.get("googleMapsUrl") ?? "").trim();
    const footerName    = String(formData.get("footerName")    ?? "").trim();
    const footerAddress = String(formData.get("footerAddress") ?? "").trim();

    let logoUrl: string | undefined;
    const logoFile = formData.get("logoFile");
    if (logoFile instanceof File && logoFile.size > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
        return { error: "Logo upload requires Vercel Blob storage. Contact support." };
      }
      const bytes = await logoFile.arrayBuffer();
      const ext = (logoFile.name.split(".").pop()?.toLowerCase() || "png").replace(/[^a-z0-9]/g, "") || "png";
      const key = `brand/logo-${Date.now()}.${ext}`;
      logoUrl = await getStorage().putObject(key, Buffer.from(bytes), logoFile.type || `image/${ext}`);
    }

    await updateStoreProfile({
      storeName, address, email, phone,
      instagramUrl, facebookUrl, linkedinUrl, googleMapsUrl,
      footerName, footerAddress,
      ...(logoUrl ? { logoUrl } : {}),
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateStoreProfile failed");
    return { error: String(err instanceof Error ? err.message : "Failed to save store settings.") };
  }
}

export async function updateThemeColorsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const hex = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : undefined;
  };
  try {
    await updateThemeColors({
      accent:     hex("accent"),
      accent2:    hex("accent2"),
      accent3:    hex("accent3"),
      background: hex("background"),
      surface:    hex("surface"),
      surface2:   hex("surface2"),
      surface3:   hex("surface3"),
      foreground: hex("foreground"),
      muted:      hex("muted"),
      border:     hex("border"),
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateThemeColors failed");
    return { error: "Failed to save theme colors." };
  }
}

// ── Cricket theme engine ──

export async function activateCricketThemeAction(slug: string) {
  await requireAdmin();
  // Validate against known themes; getCricketTheme falls back to default.
  const theme = getCricketTheme(slug);
  await updateCricketConfig({ activeSlug: theme.slug });
  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function setCricketModeAction(mode: ThemeMode) {
  await requireAdmin();
  await updateCricketConfig({ mode: mode === "light" ? "light" : "dark" });
  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function saveCricketScheduleAction(formData: FormData) {
  await requireAdmin();
  const scheduledSlug  = String(formData.get("scheduledSlug")  ?? "").trim();
  const scheduledStart = String(formData.get("scheduledStart") ?? "").trim();
  const scheduledEnd   = String(formData.get("scheduledEnd")   ?? "").trim();
  // Normalise unknown slug to "" so the resolver ignores it.
  const slug = scheduledSlug && getCricketTheme(scheduledSlug).slug === scheduledSlug ? scheduledSlug : "";
  await updateCricketConfig({ scheduledSlug: slug, scheduledStart, scheduledEnd });
  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function setCricketTaglineAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim().slice(0, 60);
  if (!slug) return;
  const cfg = await getCricketConfig();
  const taglines = { ...(cfg.taglines ?? {}), [slug]: tagline };
  await updateCricketConfig({ taglines });
  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function clearCricketScheduleAction() {
  await requireAdmin();
  await updateCricketConfig({ scheduledSlug: "", scheduledStart: "", scheduledEnd: "" });
  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function updateLoyaltySettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const programName   = String(formData.get("programName")   ?? "").trim();
  const earnRateRupees = Number(formData.get("earnRateRupees") ?? "10");
  const description   = String(formData.get("description")   ?? "").trim();
  try {
    await updateLoyaltySettings({
      programName:   programName   || undefined,
      earnRateMinor: earnRateRupees > 0 ? earnRateRupees * 100 : 1000,
      description:   description   || undefined,
    });
    revalidatePath("/account");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateLoyaltySettings failed");
    return { error: "Failed to save loyalty settings." };
  }
}

export async function updateHeroSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const titleA    = String(formData.get("titleA")    ?? "").trim();
  const titleB    = String(formData.get("titleB")    ?? "").trim();
  const subtitle  = String(formData.get("subtitle")  ?? "").trim();
  const ctaLabel  = String(formData.get("ctaLabel")  ?? "").trim();
  const ctaHref   = String(formData.get("ctaHref")   ?? "").trim();
  const badgesRaw = String(formData.get("badges")    ?? "").trim();

  const badges = badgesRaw
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 2 && parts[0] && parts[1])
    .map(([title, subtitle]) => ({ title, subtitle }));

  const trendingSlugs = formData
    .getAll("trending")
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 8);

  try {
    await updateHeroSettings({ titleA, titleB, subtitle, ctaLabel, ctaHref, badges, trendingSlugs });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateHeroSettings failed");
    return { error: "Failed to save hero settings." };
  }
}
