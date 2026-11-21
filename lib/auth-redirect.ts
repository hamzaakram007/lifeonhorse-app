import { locales, type AppLocale } from "@/i18n/routing";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/i18n-path";

const DEFAULT_POST_AUTH = "/dashboard";

/** Cookie backup when GoTrue strips `?next=` or falls back toward Site URL. */
export const AUTH_NEXT_COOKIE = "loh_auth_next";
const AUTH_NEXT_MAX_AGE_SEC = 60 * 60; // 1 hour (matches recovery link window)

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

/** Locale-aware post-auth path used as `next` and cookie value. */
export function authNextPath(nextPath: string, locale?: string): string {
  const next = safeInternalPath(nextPath);
  if (locale && (locales as readonly string[]).includes(locale)) {
    return localizedPath(next, locale);
  }
  return next;
}

/**
 * Absolute URL for Supabase emailRedirectTo / recovery redirects.
 * Always points at the non-localized `/auth/callback` route, with `next`
 * carrying the locale-aware destination.
 *
 * Must be listed on Supabase Auth redirect allow list **including query string
 * behavior** — bare `https://host/**` has historically rejected `?next=` and
 * fallen back to Site URL (homepage). Prefer also listing:
 *   https://lifeonhorse.com/auth/callback
 *   https://lifeonhorse.com/auth/callback/**
 * (+ www). Cookie backup (see setAuthNextCookie) covers stripped `next`.
 */
export function authCallbackUrl(
  origin: string,
  nextPath: string,
  locale?: string
): string {
  const localized = authNextPath(nextPath, locale);
  const url = new URL("/auth/callback", origin.replace(/\/$/, ""));
  url.searchParams.set("next", localized);
  return url.toString();
}

/** Client-side: persist intended post-auth path before sending email links. */
export function setAuthNextCookie(nextPath: string, locale?: string): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(authNextPath(nextPath, locale));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${AUTH_NEXT_COOKIE}=${value}; Path=/; Max-Age=${AUTH_NEXT_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAuthNextCookieOnResponse(response: {
  cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void };
}): void {
  response.cookies.set(AUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
}
