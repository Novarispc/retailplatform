"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { updateLoyaltySettingsAction } from "@/server/actions/store";
import type { LoyaltySettings } from "@/server/services/store";

const INPUT_CLS =
  "mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none";

export function LoyaltySettingsForm({ initial }: { initial: LoyaltySettings }) {
  const [state, action, pending] = useActionState(updateLoyaltySettingsAction, {
    ok: false,
  } as { ok?: boolean; error?: string });

  const defaultEarnRate = initial.earnRateMinor ? initial.earnRateMinor / 100 : 10;

  return (
    <form action={action} className="glass rounded-2xl p-6 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="programName">Program name</Label>
          <input
            id="programName"
            name="programName"
            defaultValue={initial.programName ?? "ASZ Points"}
            className={INPUT_CLS}
            placeholder="ASZ Points"
          />
          <p className="mt-1 text-xs text-muted">Shown on customer account page.</p>
        </div>
        <div>
          <Label htmlFor="earnRateRupees">Earn rate (₹ per point)</Label>
          <input
            id="earnRateRupees"
            name="earnRateRupees"
            type="number"
            min="1"
            step="1"
            defaultValue={defaultEarnRate}
            className={INPUT_CLS}
            placeholder="10"
          />
          <p className="mt-1 text-xs text-muted">Customer earns 1 point per this many rupees spent.</p>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <input
          id="description"
          name="description"
          defaultValue={initial.description ?? ""}
          className={INPUT_CLS}
          placeholder="Earn 1 point per ₹10 spent."
        />
        <p className="mt-1 text-xs text-muted">Optional. Shown below the points balance on account page.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save loyalty settings"}</Button>
        {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
        {state?.ok && <p className="text-sm text-success">Loyalty settings saved.</p>}
      </div>
    </form>
  );
}
