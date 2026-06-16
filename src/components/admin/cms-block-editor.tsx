"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import {
  createCmsBlockAction,
  updateCmsBlockAction,
  deleteCmsBlockAction,
  toggleCmsBlockAction,
  moveCmsBlockAction,
} from "@/server/actions/cms";

type Block = {
  id: string;
  type: "BANNER" | "FEATURED_COLLECTION" | "RICH_TEXT";
  position: number;
  active: boolean;
  dataJson: Record<string, unknown>;
};

const TYPE_LABELS: Record<Block["type"], string> = {
  BANNER: "Promo Banner",
  FEATURED_COLLECTION: "Featured Collection",
  RICH_TEXT: "Rich Text",
};

function BlockFields({ type, data }: { type: Block["type"]; data?: Record<string, unknown> }) {
  const val = (k: string) => String(data?.[k] ?? "");
  const ta = "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none";
  const inp = `${ta} h-9`;

  if (type === "BANNER") return (
    <div className="space-y-3">
      <div>
        <Label>Title</Label>
        <input name="data_title" required defaultValue={val("title")} className={inp} placeholder="Summer Sale — 30% off" />
      </div>
      <div>
        <Label>Body (optional)</Label>
        <textarea name="data_body" defaultValue={val("body")} rows={2} className={ta} placeholder="Shop the best deals before they're gone." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>CTA Label</Label>
          <input name="data_ctaLabel" defaultValue={val("ctaLabel")} className={inp} placeholder="Shop now" />
        </div>
        <div>
          <Label>CTA URL</Label>
          <input name="data_ctaHref" defaultValue={val("ctaHref")} className={inp} placeholder="/catalog?q=sale" />
        </div>
      </div>
      <div>
        <Label>Background image URL (optional)</Label>
        <input name="data_imageUrl" defaultValue={val("imageUrl")} className={inp} placeholder="https://…" />
      </div>
    </div>
  );

  if (type === "FEATURED_COLLECTION") return (
    <div className="space-y-3">
      <div>
        <Label>Section title</Label>
        <input name="data_title" required defaultValue={val("title")} className={inp} placeholder="Staff Picks" />
      </div>
      <div>
        <Label>Product slugs (comma-separated)</Label>
        <input name="data_productSlugs" required defaultValue={val("productSlugs")} className={inp} placeholder="aurora-headphones, nova-watch, …" />
      </div>
    </div>
  );

  if (type === "RICH_TEXT") return (
    <div>
      <Label>Content</Label>
      <textarea name="data_content" required defaultValue={val("content")} rows={5} className={ta} placeholder="Write your content here…" />
    </div>
  );

  return null;
}

function BlockPreview({ block }: { block: Block }) {
  const d = block.dataJson;
  if (block.type === "BANNER") return <span className="text-xs text-muted">{String(d.title ?? "")}</span>;
  if (block.type === "FEATURED_COLLECTION") return <span className="text-xs text-muted">{String(d.title ?? "")}</span>;
  if (block.type === "RICH_TEXT") return <span className="text-xs text-muted line-clamp-1">{String(d.content ?? "").slice(0, 80)}</span>;
  return null;
}

function EditBlockForm({ block, pageId, onClose }: { block: Block; pageId: string; onClose: () => void }) {
  return (
    <form
      action={async (fd) => {
        fd.append("id", block.id);
        fd.append("pageId", pageId);
        await updateCmsBlockAction(fd);
        onClose();
      }}
      className="mt-3 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
    >
      <BlockFields type={block.type} data={block.dataJson} />
      <div className="flex gap-2">
        <Button type="submit" size="sm"><Check className="h-3.5 w-3.5" /> Save</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}><X className="h-3.5 w-3.5" /> Cancel</Button>
      </div>
    </form>
  );
}

function BlockRow({ block, pageId, isFirst, isLast }: { block: Block; pageId: string; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className={`rounded-xl border p-4 ${block.active ? "border-[var(--border)]" : "border-dashed border-[var(--border)] opacity-60"}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{TYPE_LABELS[block.type]}</span>
          <div className="mt-0.5"><BlockPreview block={block} /></div>
        </div>
        <div className="flex items-center gap-1">
          <form action={moveCmsBlockAction}>
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="pageId" value={pageId} />
            <input type="hidden" name="direction" value="up" />
            <button type="submit" disabled={isFirst} className="grid h-7 w-7 place-items-center rounded text-muted hover:text-foreground disabled:opacity-30">
              <ChevronUp className="h-4 w-4" />
            </button>
          </form>
          <form action={moveCmsBlockAction}>
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="pageId" value={pageId} />
            <input type="hidden" name="direction" value="down" />
            <button type="submit" disabled={isLast} className="grid h-7 w-7 place-items-center rounded text-muted hover:text-foreground disabled:opacity-30">
              <ChevronDown className="h-4 w-4" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="grid h-7 w-7 place-items-center rounded text-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <form action={toggleCmsBlockAction}>
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="pageId" value={pageId} />
            <button type="submit" className="grid h-7 w-7 place-items-center rounded text-muted hover:text-foreground">
              {block.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </form>
          <form action={deleteCmsBlockAction}>
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="pageId" value={pageId} />
            <button type="submit" className="grid h-7 w-7 place-items-center rounded text-muted hover:text-[var(--danger)]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
      {editing && <EditBlockForm block={block} pageId={pageId} onClose={() => setEditing(false)} />}
    </div>
  );
}

function AddBlockForm({ pageId, position }: { pageId: string; position: number }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Block["type"]>("BANNER");

  if (!open) return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="w-full rounded-xl border border-dashed border-[var(--border)] py-3 text-sm text-muted hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
    >
      + Add block
    </button>
  );

  return (
    <form
      action={async (fd) => {
        fd.append("pageId", pageId);
        fd.append("type", type);
        fd.append("position", String(position));
        await createCmsBlockAction(fd);
        setOpen(false);
      }}
      className="space-y-4 rounded-xl border border-[var(--accent)]/40 bg-[var(--surface-2)] p-4"
    >
      <div>
        <Label>Block type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Block["type"])}
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
        >
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <BlockFields type={type} />
      <div className="flex gap-2">
        <Button type="submit" size="sm"><Check className="h-3.5 w-3.5" /> Add</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}><X className="h-3.5 w-3.5" /> Cancel</Button>
      </div>
    </form>
  );
}

export function CmsBlockEditor({ pageId, blocks }: { pageId: string; blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <BlockRow
          key={block.id}
          block={block}
          pageId={pageId}
          isFirst={i === 0}
          isLast={i === blocks.length - 1}
        />
      ))}
      <AddBlockForm pageId={pageId} position={blocks.length} />
    </div>
  );
}
