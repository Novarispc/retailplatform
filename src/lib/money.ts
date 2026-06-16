// All monetary values stored as integer minor units (paise for INR).
// Currency abstraction so SEK/EUR/USD slot in later without refactor.

export type CurrencyCode = "INR" | "USD" | "EUR" | "SEK";

const CURRENCY_META: Record<
  CurrencyCode,
  { locale: string; minorPerMajor: number }
> = {
  INR: { locale: "en-IN", minorPerMajor: 100 },
  USD: { locale: "en-US", minorPerMajor: 100 },
  EUR: { locale: "de-DE", minorPerMajor: 100 },
  SEK: { locale: "sv-SE", minorPerMajor: 100 },
};

export function formatMoney(minor: number, currency: CurrencyCode = "INR") {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.INR;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
  }).format(minor / meta.minorPerMajor);
}

export function toMajor(minor: number, currency: CurrencyCode = "INR") {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.INR;
  return minor / meta.minorPerMajor;
}
