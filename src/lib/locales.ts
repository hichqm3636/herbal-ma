export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: "ar" = "ar";

export function isLocale(value: unknown): value is Locale {
  return value === "ar" || value === "en";
}

export function getLocaleDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLocaleRoot(locale: Locale): "/ar/" | "/en/" {
  return locale === "ar" ? "/ar/" : "/en/";
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
