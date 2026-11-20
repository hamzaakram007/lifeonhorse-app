import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/auth-redirect";
import { NextResponse } from "next/server";

/**
 * PKCE / email-link exchange endpoint (not under [locale]).
 * Supabase redirects here with ?code=…&next=/… after confirm / recovery / magic link.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/dashboard");
  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (errorDescription) {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL("/auth/login", origin);
      login.searchParams.set("error", "link");
      return NextResponse.redirect(login);
    }
  }

  // If this was an email confirmation with no next override, land on login with success.
  // Recovery links should pass next=/auth/reset-password (locale-aware).
  const isAuthPage = next.includes("/auth/");
  if (!isAuthPage && searchParams.get("type") === "signup") {
    const login = new URL("/auth/login", origin);
    login.searchParams.set("confirmed", "1");
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL(next, origin));
}
