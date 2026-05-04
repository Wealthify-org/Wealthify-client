import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "./locales";

/**
 * next-intl server config — читает локаль из cookie (или Accept-Language как fallback).
 * Нет URL-префикса: пользователь живёт на /home, /portfolios — и т.д.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale = isSupportedLocale(cookieLocale) ? cookieLocale : null;

  // если cookie нет — пытаемся определить из Accept-Language
  if (!locale) {
    const headerStore = await headers();
    const acceptLang = headerStore.get("accept-language") ?? "";
    const preferred = acceptLang.split(",")[0]?.trim().toLowerCase() ?? "";
    const short = preferred.split("-")[0];
    locale = isSupportedLocale(short) ? short : DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "UTC",
  };
});
