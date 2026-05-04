export const SUPPORTED_LOCALES = ["en", "ru"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_TTL = 60 * 60 * 24 * 365; // 1 год

export const isSupportedLocale = (v: unknown): v is SupportedLocale =>
  typeof v === "string" &&
  (SUPPORTED_LOCALES as readonly string[]).includes(v);
