"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, DEFAULT_LOCALE } from "./locales";

export async function setLocale(next: string) {
  const locale = isLocale(next) ? next : DEFAULT_LOCALE;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
}
