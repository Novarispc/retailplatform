import type { CurrencyCode } from "./money";

export const CURRENCY_COOKIE = "NOVA_CURRENCY";
export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["INR", "EUR", "SEK"];
export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: "₹ INR",
  EUR: "€ EUR",
  SEK: "kr SEK",
  USD: "$ USD",
};

export function isCurrency(v: string | undefined): v is CurrencyCode {
  return !!v && (SUPPORTED_CURRENCIES as string[]).includes(v);
}
