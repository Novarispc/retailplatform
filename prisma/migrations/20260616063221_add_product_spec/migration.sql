-- CreateEnum
CREATE TYPE "public"."TrustPostType" AS ENUM ('PHOTO', 'VIDEO', 'SHORT');

-- CreateEnum
CREATE TYPE "public"."CmsBlockType" AS ENUM ('BANNER', 'FEATURED_COLLECTION', 'RICH_TEXT');

-- CreateTable
CREATE TABLE "public"."ProductSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrustPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "public"."TrustPostType" NOT NULL DEFAULT 'PHOTO',
    "title" TEXT,
    "caption" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CmsPage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CmsBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" "public"."CmsBlockType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSpec_key_value_idx" ON "public"."ProductSpec"("key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpec_productId_key_key" ON "public"."ProductSpec"("productId", "key");

-- CreateIndex
CREATE INDEX "TrustPost_tenantId_active_position_idx" ON "public"."TrustPost"("tenantId", "active", "position");

-- CreateIndex
CREATE INDEX "CmsPage_tenantId_idx" ON "public"."CmsPage"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_tenantId_slug_key" ON "public"."CmsPage"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "CmsBlock_pageId_position_idx" ON "public"."CmsBlock"("pageId", "position");

-- AddForeignKey
ALTER TABLE "public"."ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrustPost" ADD CONSTRAINT "TrustPost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CmsPage" ADD CONSTRAINT "CmsPage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CmsBlock" ADD CONSTRAINT "CmsBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
