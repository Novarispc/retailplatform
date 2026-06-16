import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import type { CmsBlockType, Prisma } from "@prisma/client";

export type BlockData = Prisma.InputJsonValue;

export async function listCmsPages() {
  const tenant = await getActiveTenant();
  return prisma.cmsPage.findMany({
    where: { tenantId: tenant.id },
    include: { _count: { select: { blocks: true } } },
    orderBy: { slug: "asc" },
  });
}

export async function getCmsPageForEdit(id: string) {
  const tenant = await getActiveTenant();
  return prisma.cmsPage.findFirst({
    where: { id, tenantId: tenant.id },
    include: { blocks: { orderBy: { position: "asc" } } },
  });
}

export async function getCmsBlocksForPage(slug: string) {
  const tenant = await getActiveTenant();
  const page = await prisma.cmsPage.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
    include: { blocks: { where: { active: true }, orderBy: { position: "asc" } } },
  });
  return page?.blocks ?? [];
}

export async function upsertCmsPage(slug: string, title: string) {
  const tenant = await getActiveTenant();
  return prisma.cmsPage.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
    create: { tenantId: tenant.id, slug, title },
    update: { title },
  });
}

export async function createCmsBlock(pageId: string, type: CmsBlockType, data: BlockData, position: number) {
  return prisma.cmsBlock.create({
    data: { pageId, type, dataJson: data, position },
  });
}

export async function updateCmsBlock(id: string, data: BlockData) {
  return prisma.cmsBlock.update({ where: { id }, data: { dataJson: data } });
}

export async function toggleCmsBlock(id: string) {
  const block = await prisma.cmsBlock.findUniqueOrThrow({ where: { id } });
  return prisma.cmsBlock.update({ where: { id }, data: { active: !block.active } });
}

export async function deleteCmsBlock(id: string) {
  return prisma.cmsBlock.delete({ where: { id } });
}

export async function moveCmsBlock(id: string, direction: "up" | "down") {
  const block = await prisma.cmsBlock.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.cmsBlock.findMany({
    where: { pageId: block.pageId },
    orderBy: { position: "asc" },
  });
  const idx = siblings.findIndex((b) => b.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return;
  const swap = siblings[swapIdx];
  await Promise.all([
    prisma.cmsBlock.update({ where: { id }, data: { position: swap.position } }),
    prisma.cmsBlock.update({ where: { id: swap.id }, data: { position: block.position } }),
  ]);
}
