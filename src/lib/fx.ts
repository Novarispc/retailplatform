// Static FX rates relative to INR minor units (paise).
// 1 EUR ≈ 90 INR, 1 SEK ≈ 9 INR. Update periodically; not meant for financial precision.

import type { CurrencyCode } from "./money";

// How many INR paise equal one minor unit of target currency.
const PAISE_PER_MINOR: Record<CurrencyCode, number> = {
  INR: 1,
  EUR: 9000,  // 1 EUR = ₹90 → 1 eurocent = 90 paise
  SEK: 900,   // 1 SEK = ₹9  → 1 öre     = 9 paise
  USD: 8300,  // 1 USD = ₹83 → 1 cent     = 83 paise
};

/** Convert INR minor units (paise) → target currency minor units. */
export function fromINRMinor(paiseAmount: number, target: CurrencyCode): number {
  if (target === "INR") return paiseAmount;
  return Math.round(paiseAmount / PAISE_PER_MINOR[target]);
}

/** Convert target currency minor units → INR minor units (paise). */
export function toINRMinor(amount: number, from: CurrencyCode): number {
  if (from === "INR") return amount;
  return Math.round(amount * PAISE_PER_MINOR[from]);
}
