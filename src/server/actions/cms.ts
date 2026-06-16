"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import type { CmsBlockType } from "@prisma/client";
import {
  upsertCmsPage,
  createCmsBlock,
  updateCmsBlock,
  deleteCmsBlock,
  toggleCmsBlock,
  moveCmsBlock,
} from "@/server/services/cms";

export type CmsActionState = { error?: string; ok?: boolean };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin/cms");
  assert(session.user.role, "admin.access");
}

export async function createCmsPageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const title = String(formData.get("title") ?? "").trim();
  if (!slug) return { error: "Slug is required." };
  if (!title) return { error: "Title is required." };
  try {
    const page = await upsertCmsPage(slug, title);
    revalidatePath("/admin/cms");
    redirect(`/admin/cms/${page.id}`);
  } catch (err) {
    logger.error({ err }, "createCmsPage failed");
    return { error: "Failed to create page." };
  }
}

export async function createCmsBlockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type")) as CmsBlockType;
  const position = Number(formData.get("position") ?? 0);

  const data: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("data_")) data[k.slice(5)] = String(v);
  }

  try {
    await createCmsBlock(pageId, type, data, position);
  } catch (err) {
    logger.error({ err }, "createCmsBlock failed");
  }
  revalidatePath(`/admin/cms/${pageId}`);
  revalidatePath("/");
}

export async function updateCmsBlockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));

  const data: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("data_")) data[k.slice(5)] = String(v);
  }

  try {
    await updateCmsBlock(id, data);
  } catch (err) {
    logger.error({ err }, "updateCmsBlock failed");
  }
  revalidatePath(`/admin/cms/${pageId}`);
  revalidatePath("/");
}

export async function toggleCmsBlockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  try {
    await toggleCmsBlock(id);
  } catch (err) {
    logger.error({ err }, "toggleCmsBlock failed");
  }
  revalidatePath(`/admin/cms/${pageId}`);
  revalidatePath("/");
}

export async function deleteCmsBlockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  try {
    await deleteCmsBlock(id);
  } catch (err) {
    logger.error({ err }, "deleteCmsBlock failed");
  }
  revalidatePath(`/admin/cms/${pageId}`);
  revalidatePath("/");
}

export async function moveCmsBlockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const direction = String(formData.get("direction")) as "up" | "down";
  try {
    await moveCmsBlock(id, direction);
  } catch (err) {
    logger.error({ err }, "moveCmsBlock failed");
  }
  revalidatePath(`/admin/cms/${pageId}`);
}
