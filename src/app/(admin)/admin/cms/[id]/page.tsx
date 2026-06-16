import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCmsPageForEdit } from "@/server/services/cms";
import { CmsBlockEditor } from "@/components/admin/cms-block-editor";

export const metadata: Metadata = { title: "Edit page · CMS · Admin", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function CmsPageEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const page = await getCmsPageForEdit(id);
  if (!page) notFound();

  return (
    <div>
      <Link href="/admin/cms" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Content pages
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-1 text-sm text-muted">/{page.slug}</p>
      </div>
      <CmsBlockEditor
        pageId={page.id}
        blocks={page.blocks.map((b) => ({
          ...b,
          dataJson: b.dataJson as Record<string, unknown>,
        }))}
      />
    </div>
  );
}
