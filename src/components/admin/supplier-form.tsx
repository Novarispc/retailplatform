"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createSupplierAction } from "@/server/actions/admin";

export function SupplierForm() {
  const [state, action, pending] = useActionState(createSupplierAction, {});
  return (
    <form action={action} className="glass mb-6 rounded-[var(--radius)] p-6">
      <h2 className="mb-4 font-semibold">New supplier</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Acme Components" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="sales@acme.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+91…" />
        </div>
      </div>
      {state.error && <p className="mt-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.ok && <p className="mt-3 text-sm text-[var(--success)]">Supplier added.</p>}
      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add supplier</>}
      </Button>
    </form>
  );
}
