import { locales, type AppLocale } from "@/i18n/routing";

/** Strip a leading locale segment from a pathname (e.g. /ur/admin → /admin). */
export function stripLocalePrefix(pathname: string): {
  locale: AppLocale | null;
  pathname: string;
} {
  const segments = pathname.split("/");
  const maybe = segments[1];
  if (maybe && (locales as readonly string[]).includes(maybe)) {
    const rest = "/" + segments.slice(2).join("/");
    return {
      locale: maybe as AppLocale,
      pathname: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return { locale: null, pathname };
}

/** Prefix a path with locale when needed (default en stays unprefixed). */
export function withLocalePrefix(pathname: string, locale: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!locale || locale === "en") return normalized === "" ? "/" : normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}
