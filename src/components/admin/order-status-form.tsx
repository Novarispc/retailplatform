"use client";

import { useActionState } from "react";
import type { OrderStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/server/actions/admin";

export function OrderStatusForm({
  orderId,
  current,
  options,
}: {
  orderId: string;
  current: OrderStatus;
  options: OrderStatus[];
}) {
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, {});

  if (options.length === 0) {
    return <p className="text-sm text-muted">No further status changes available ({current}).</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={options[0]}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update status"}
      </Button>
      {state.error && <span className="text-sm text-[var(--danger)]">{state.error}</span>}
      {state.ok && <span className="text-sm text-[var(--success)]">Updated</span>}
    </form>
  );
}
