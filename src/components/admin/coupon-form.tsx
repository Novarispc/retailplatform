"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createCouponAction } from "@/server/actions/admin";

export function CouponForm() {
  const [state, action, pending] = useActionState(createCouponAction, {});
  return (
    <form action={action} className="glass mb-8 rounded-[var(--radius)] p-6">
      <h2 className="mb-4 font-semibold">New coupon</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" required placeholder="SUMMER20" className="uppercase" />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none">
            <option value="PERCENT">Percent %</option>
            <option value="FIXED">Fixed ₹</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>
        <div>
          <Label htmlFor="value">Value (% or ₹)</Label>
          <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={0} />
        </div>
        <div>
          <Label htmlFor="minSpendMajor">Min spend (₹)</Label>
          <Input id="minSpendMajor" name="minSpendMajor" type="number" step="1" min="0" defaultValue={0} />
        </div>
        <div>
          <Label htmlFor="maxRedemptions">Max uses (blank = ∞)</Label>
          <Input id="maxRedemptions" name="maxRedemptions" type="number" min="0" />
        </div>
      </div>
      {state.error && <p className="mt-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.ok && <p className="mt-3 text-sm text-[var(--success)]">Coupon created.</p>}
      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Create coupon</>}
      </Button>
    </form>
  );
}
