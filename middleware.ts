import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createMiddleware(routing);

/** Auth cookie endpoints must not be locale-prefixed or redirected. */
function isAuthApiPath(pathname: string) {
  return (
    pathname === "/auth/callback" ||
    pathname.startsWith("/auth/callback/") ||
    pathname === "/auth/signout" ||
    pathname.startsWith("/auth/signout/")
  );
}

/**
 * When redirectTo is missing from uri_allow_list, GoTrue falls back to Site URL
 * and drops the user on `/` (or a locale home) with `?code=…`. Rescue that onto
 * `/auth/callback` so PKCE exchange still runs; `loh_auth_next` cookie supplies `next`.
 */
function rescueAuthCodeOnSiteUrl(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (isAuthApiPath(pathname)) return null;
  if (!searchParams.get("code") && !searchParams.get("error")) return null;

  // Only homepage / locale homes — avoid hijacking unrelated `?code=` query usage.
  const isHome =
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/ur" ||
    pathname === "/ar";
  if (!isHome) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const rescued = rescueAuthCodeOnSiteUrl(request);
  if (rescued) {
    return updateSession(request, rescued);
  }

  if (isAuthApiPath(request.nextUrl.pathname)) {
    return updateSession(request, NextResponse.next());
  }

  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  // Skip Next internals, Serwist SW, static assets, and auth cookie endpoints.
  // /auth/callback + /auth/signout must not go through next-intl (it 404s them as pages).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|auth/callback|auth/signout|serwist/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js|map)$).*)",
  ],
};
