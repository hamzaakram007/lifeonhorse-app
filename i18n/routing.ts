import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ur", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const rtlLocales: readonly AppLocale[] = ["ur", "ar"];

export const localeNames: Record<AppLocale, string> = {
  en: "English",
  ur: "اردو",
  ar: "العربية",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // Keep production English URLs unprefixed (/marketplace, /clubs, …).
  // Urdu/Arabic use /ur/... and /ar/...
  localePrefix: "as-needed",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}
