"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { ActionState } from "@/server/actions/admin";

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  priceMajor: number;
  categoryId: string;
  featured: boolean;
  active: boolean;
  imageUrl: string;
  stock: number;
  specs?: { key: string; value: string }[];
}

function SpecEditor({ initial }: { initial?: { key: string; value: string }[] }) {
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(initial ?? []);

  function addRow() {
    setSpecs((s) => [...s, { key: "", value: "" }]);
  }

  function removeRow(i: number) {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: "key" | "value", val: string) {
    setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Specifications</Label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
        >
          <Plus className="h-3 w-3" /> Add spec
        </button>
      </div>
      <input type="hidden" name="specsJson" value={JSON.stringify(specs)} />
      {specs.length === 0 && (
        <p className="text-xs text-muted">No specifications. Click "Add spec" to add key-value attributes.</p>
      )}
      <div className="space-y-2">
        {specs.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Key (e.g. Brand)"
              value={row.key}
              onChange={(e) => updateRow(i, "key", e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value (e.g. Sony)"
              value={row.value}
              onChange={(e) => updateRow(i, "value", e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-muted hover:text-[var(--danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} encType="multipart/form-data" className="glass space-y-5 rounded-[var(--radius)] p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required defaultValue={initial?.slug} placeholder="aurora-headphones" />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={initial?.description}
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="priceMajor">Price (₹)</Label>
          <Input id="priceMajor" name="priceMajor" type="number" step="0.01" min="0" required defaultValue={initial?.priceMajor} />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" required defaultValue={initial?.stock ?? 0} />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={initial?.imageUrl} placeholder="https://…" />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-4">
          <Label htmlFor="imageFile">Image file</Label>
          <p className="text-xs text-muted">Upload takes precedence over URL</p>
        </div>
        <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
      </div>

      <SpecEditor initial={initial?.specs} />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="h-4 w-4 accent-[var(--accent)]" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4 accent-[var(--accent)]" />
          Active
        </label>
      </div>

      {state.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
        <Link href="/admin/products"><Button type="button" variant="ghost">Cancel</Button></Link>
      </div>
    </form>
  );
}
