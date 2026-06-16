"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { assert } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { getActiveTenant } from "@/lib/tenant";
import type { TrustPostType } from "@prisma/client";

async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const ext = (file.name.split(".").pop()?.toLowerCase() || "mp4").replace(/[^a-z0-9]/g, "") || "mp4";
  const key = `trust/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return getStorage().putObject(key, Buffer.from(bytes), file.type || `video/${ext}`);
}

export async function createTrustPostAction(formData: FormData) {
  const session = await auth();
  assert(session?.user?.role ?? "CUSTOMER", "admin.access");

  const tenant = await getActiveTenant();
  const type = (formData.get("type") as TrustPostType) || "PHOTO";

  // File upload takes priority over URL field.
  const videoFile = formData.get("videoFile") as File | null;
  let url = (formData.get("url") as string)?.trim();
  if (videoFile && videoFile.size > 0) {
    url = await saveUploadedFile(videoFile);
  }
  if (!url) return;

  const title = (formData.get("title") as string)?.trim() || null;
  const caption = (formData.get("caption") as string)?.trim() || null;
  const thumbnail = (formData.get("thumbnail") as string)?.trim() || null;

  const maxPos = await prisma.trustPost.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.trustPost.create({
    data: {
      tenantId: tenant.id,
      type,
      url,
      title,
      caption,
      thumbnail,
      position: (maxPos?.position ?? -1) + 1,
    },
  });

  revalidatePath("/admin/trust-wall");
  revalidatePath("/");
}

export async function toggleTrustPostAction(formData: FormData) {
  const session = await auth();
  assert(session?.user?.role ?? "CUSTOMER", "admin.access");

  const id = formData.get("id") as string;
  const current = formData.get("active") === "true";

  await prisma.trustPost.update({ where: { id }, data: { active: !current } });

  revalidatePath("/admin/trust-wall");
  revalidatePath("/");
}

export async function deleteTrustPostAction(formData: FormData) {
  const session = await auth();
  assert(session?.user?.role ?? "CUSTOMER", "admin.access");

  const id = formData.get("id") as string;
  await prisma.trustPost.delete({ where: { id } });

  revalidatePath("/admin/trust-wall");
  revalidatePath("/");
}
