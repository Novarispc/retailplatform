"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { updateHeroSettings, updateStoreProfile } from "@/server/services/store";
import { getStorage } from "@/lib/storage";

export async function updateStoreProfileAction(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const storeName    = String(formData.get("storeName")    ?? "").trim();
  const address      = String(formData.get("address")      ?? "").trim();
  const email        = String(formData.get("email")        ?? "").trim();
  const phone        = String(formData.get("phone")        ?? "").trim();
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();
  const facebookUrl  = String(formData.get("facebookUrl")  ?? "").trim();
  const linkedinUrl  = String(formData.get("linkedinUrl")  ?? "").trim();
  const googleMapsUrl= String(formData.get("googleMapsUrl")  ?? "").trim();
  const footerName   = String(formData.get("footerName")   ?? "").trim();
  const footerAddress= String(formData.get("footerAddress") ?? "").trim();

  let logoUrl: string | undefined;
  const logoFile = formData.get("logoFile");
  if (logoFile instanceof File && logoFile.size > 0) {
    const bytes = await logoFile.arrayBuffer();
    const ext = (logoFile.name.split(".").pop()?.toLowerCase() || "png").replace(/[^a-z0-9]/g, "") || "png";
    const key = `brand/logo-${Date.now()}.${ext}`;
    logoUrl = await getStorage().putObject(key, Buffer.from(bytes), logoFile.type || `image/${ext}`);
  }

  try {
    await updateStoreProfile({
      storeName, address, email, phone,
      instagramUrl, facebookUrl, linkedinUrl, googleMapsUrl,
      footerName, footerAddress,
      ...(logoUrl ? { logoUrl } : {}),
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateStoreProfile failed");
    return { error: "Failed to save store settings." };
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin");
  assert(session.user.role, "admin.access");
  return session.user;
}

export async function updateHeroSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const titleA = String(formData.get("titleA") ?? "").trim();
  const titleB = String(formData.get("titleB") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const badgesRaw = String(formData.get("badges") ?? "").trim();

  const badges = badgesRaw
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 2 && parts[0] && parts[1])
    .map(([title, subtitle]) => ({ title, subtitle }));

  // "Now trending" hero items — selected product slugs (checkbox list).
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
