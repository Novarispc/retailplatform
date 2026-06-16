"use client";

import { useCurrency } from "@/lib/use-currency";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/money";

export function CurrencySwitcher() {
  const { currency, setCurrency, isPending } = useCurrency();

  return (
    <select
      value={currency}
      disabled={isPending}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-muted transition-colors hover:text-foreground focus:outline-none disabled:opacity-50"
      aria-label="Select currency"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
      ))}
    </select>
  );
}
