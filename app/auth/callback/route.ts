import { createClient } from "@/lib/supabase/server";
import { AUTH_NEXT_COOKIE, safeInternalPath } from "@/lib/auth-redirect";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * PKCE / email-link exchange endpoint (not under [locale]).
 * Supabase redirects here with ?code=… after confirm / recovery / magic link.
 * Destination comes from ?next=… and/or the short-lived loh_auth_next cookie
 * (cookie avoids allow-list rejection of redirect URLs with query strings).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const cookieNext = cookieStore.get(AUTH_NEXT_COOKIE)?.value;
  const decodedCookieNext = cookieNext ? decodeURIComponent(cookieNext) : null;
  const next = safeInternalPath(
    searchParams.get("next") ?? decodedCookieNext,
    "/dashboard"
  );
  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");

  const clearNextCookie = (response: NextResponse) => {
    response.cookies.set(AUTH_NEXT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  };

  if (errorDescription) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "link");
    return clearNextCookie(NextResponse.redirect(login));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL("/auth/login", origin);
      login.searchParams.set("error", "link");
      return clearNextCookie(NextResponse.redirect(login));
    }
  }

  // If this was an email confirmation with no next override, land on login with success.
  // Recovery links should pass next=/auth/reset-password (locale-aware) via query or cookie.
  const isAuthPage = next.includes("/auth/");
  if (!isAuthPage && searchParams.get("type") === "signup") {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("confirmed", "1");
    return clearNextCookie(NextResponse.redirect(login));
  }

  return clearNextCookie(NextResponse.redirect(new URL(next, origin)));
}
