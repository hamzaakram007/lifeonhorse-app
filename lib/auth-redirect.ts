import { locales, type AppLocale } from "@/i18n/routing";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/i18n-path";

const DEFAULT_POST_AUTH = "/dashboard";

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = DEFAULT_POST_AUTH
): string {
  if (!candidate) return fallback;
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

export function localeFromPath(pathname: string): AppLocale {
  const { locale } = stripLocalePrefix(pathname);
  return locale ?? "en";
}

/** Build a locale-aware internal path for post-auth navigation. */
export function localizedPath(pathname: string, locale: string): string {
  const { pathname: bare } = stripLocalePrefix(pathname);
  return withLocalePrefix(bare || "/", locale);
}

/**
 * Absolute URL for Supabase emailRedirectTo / recovery redirects.
 * Always points at the non-localized `/auth/callback` route, with `next`
 * carrying the locale-aware destination.
 */
export function authCallbackUrl(
  origin: string,
  nextPath: string,
  locale?: string
): string {
  const next = safeInternalPath(nextPath);
  const localized =
    locale && (locales as readonly string[]).includes(locale)
      ? localizedPath(next, locale)
      : next;
  const url = new URL("/auth/callback", origin.replace(/\/$/, ""));
  url.searchParams.set("next", localized);
  return url.toString();
}
