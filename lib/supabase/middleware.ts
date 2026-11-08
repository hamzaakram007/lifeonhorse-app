import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/i18n-path";

/**
 * Refresh the Supabase auth session onto an existing middleware response
 * (typically from next-intl) without replacing redirects/rewrites.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, pathname } = stripLocalePrefix(request.nextUrl.pathname);
  const effectiveLocale =
    locale ?? request.cookies.get("NEXT_LOCALE")?.value ?? "en";

  if ((pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix("/auth/login", effectiveLocale);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
