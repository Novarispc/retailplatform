"use client";

import { useActionState } from "react";
import { Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createGiftCardAction } from "@/server/actions/admin";

export function GiftCardForm() {
  const [state, action, pending] = useActionState(createGiftCardAction, {});
  return (
    <form action={action} className="glass mb-6 rounded-[var(--radius)] p-6">
      <h2 className="mb-4 flex items-center gap-2 font-semibold"><Gift className="h-4 w-4 text-[var(--accent-3)]" /> Issue gift card</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="amountMajor">Amount (₹)</Label>
          <Input id="amountMajor" name="amountMajor" type="number" min="1" step="1" required defaultValue={1000} className="w-40" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate code"}
        </Button>
      </div>
      {state.error && <p className="mt-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.ok && <p className="mt-3 text-sm text-[var(--success)]">{state.message}</p>}
    </form>
  );
}
