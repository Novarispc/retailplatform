import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "./locales";

// Cookie-based locale (no URL routing). The locale cookie is set by the language switcher.
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NOVA_LOCALE")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
