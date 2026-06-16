"use client";

import { useState, useActionState } from "react";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { updateSupplierAction, deleteSupplierAction } from "@/server/actions/admin";
import { TD } from "@/components/admin/table";

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  _count: { purchaseOrders: number };
};

export function SupplierRow({ s, onReorder }: { s: Supplier; onReorder: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev: { error?: string; ok?: boolean }, fd: FormData) => {
    const result = await updateSupplierAction(prev, fd);
    if (result.ok) setEditing(false);
    return result;
  }, {});

  if (editing) {
    return (
      <tr className="border-b border-[var(--border)]">
        <form action={action} className="contents">
          <input type="hidden" name="id" value={s.id} />
          <TD>
            <input
              name="name"
              defaultValue={s.name}
              required
              className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </TD>
          <TD>
            <input
              name="email"
              type="email"
              defaultValue={s.email ?? ""}
              className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </TD>
          <TD>
            <input
              name="phone"
              defaultValue={s.phone ?? ""}
              className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </TD>
          <TD>{s._count.purchaseOrders}</TD>
          <TD className="text-right">
            <div className="flex items-center justify-end gap-2">
              {state.error && <span className="text-xs text-[var(--danger)]">{state.error}</span>}
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </TD>
        </form>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[var(--border)]">
      <TD className="font-medium">{s.name}</TD>
      <TD className="text-muted">{s.email ?? "—"}</TD>
      <TD className="text-muted">{s.phone ?? "—"}</TD>
      <TD>{s._count.purchaseOrders}</TD>
      <TD className="text-right">
        <div className="flex items-center justify-end gap-3">
          {onReorder}
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <form action={deleteSupplierAction} className="inline">
            <input type="hidden" name="id" value={s.id} />
            <button className="flex items-center gap-1 text-sm text-muted hover:text-[var(--danger)]">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </form>
        </div>
      </TD>
    </tr>
  );
}
