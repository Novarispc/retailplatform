"use server";

import { cookies } from "next/headers";
import type { CurrencyCode } from "./money";
import { CURRENCY_COOKIE, SUPPORTED_CURRENCIES } from "./currency";

export async function getCurrency(): Promise<CurrencyCode> {
  const jar = await cookies();
  const v = jar.get(CURRENCY_COOKIE)?.value;
  if (v && (SUPPORTED_CURRENCIES as string[]).includes(v)) return v as CurrencyCode;
  return "INR";
}

export async function setCurrencyAction(currency: CurrencyCode) {
  const jar = await cookies();
  jar.set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
