import Link from "next/link";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { listCmsPages } from "@/server/services/cms";
import { NewPageForm } from "./new-page-form";

export const metadata: Metadata = { title: "CMS Pages · Admin", robots: { index: false } };

export default async function CmsPagesPage() {
  const pages = await listCmsPages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
      </div>

      <div className="mb-8">
        <NewPageForm />
      </div>

      {pages.length === 0 ? (
        <p className="text-muted">No pages yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={`/admin/cms/${p.id}`}
              className="glass flex items-center gap-4 rounded-2xl p-4 hover:border-[var(--accent)]/40 transition-colors"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">/{p.slug}</p>
              </div>
              <span className="text-xs text-muted">{p._count.blocks} block{p._count.blocks !== 1 ? "s" : ""}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${p.active ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--surface-2)] text-muted"}`}>
                {p.active ? "Active" : "Hidden"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
