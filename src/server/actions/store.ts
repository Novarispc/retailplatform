"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { updateHeroSettings } from "@/server/services/store";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin");
  assert(session.user.role, "admin.access");
  return session.user;
}

export async function updateHeroSettingsAction(formData: FormData) {
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

  try {
    await updateHeroSettings({ titleA, titleB, subtitle, ctaLabel, ctaHref, badges });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "updateHeroSettings failed");
    return { error: "Failed to save hero settings." };
  }
}
