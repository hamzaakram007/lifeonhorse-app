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

export async function middleware(request: NextRequest) {
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
