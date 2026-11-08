import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  // Skip i18n/auth for Next internals, Serwist SW, static icons/manifest, and assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|serwist/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js|map)$).*)",
  ],
};
