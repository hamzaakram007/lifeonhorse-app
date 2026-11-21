import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_NEXT_COOKIE,
  clearAuthNextCookieOnResponse,
  safeInternalPath,
} from "@/lib/auth-redirect";
import { NextResponse } from "next/server";

/**
 * PKCE / email-link exchange endpoint (not under [locale]).
 * Supabase redirects here with ?code=…&next=/… after confirm / recovery / magic link.
 * `next` may also arrive via the loh_auth_next cookie when the allow list strips query params.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const jar = await cookies();
  const rawCookieNext = jar.get(AUTH_NEXT_COOKIE)?.value;
  const decodedCookieNext = rawCookieNext
    ? safeInternalPath(decodeURIComponent(rawCookieNext))
    : null;
  const next = safeInternalPath(
    searchParams.get("next") ?? decodedCookieNext,
    "/dashboard"
  );
  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");

  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, origin));
    clearAuthNextCookieOnResponse(response);
    return response;
  };

  if (errorDescription) {
    return redirect("/auth/login?error=link");
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirect("/auth/login?error=link");
    }
  }

  // If this was an email confirmation with no next override, land on login with success.
  // Recovery links should pass next=/auth/reset-password (locale-aware).
  const isAuthPage = next.includes("/auth/");
  if (!isAuthPage && searchParams.get("type") === "signup") {
    return redirect("/auth/login?confirmed=1");
  }

  return redirect(next);
}
