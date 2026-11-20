import { createClient } from "@/lib/supabase/server";
import { localeFromPath } from "@/lib/auth-redirect";
import { withLocalePrefix } from "@/lib/i18n-path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const referer = request.headers.get("referer");
  let locale = "en";
  try {
    if (referer) {
      locale = localeFromPath(new URL(referer).pathname);
    }
  } catch {
    /* ignore bad referer */
  }

  const home = withLocalePrefix("/", locale);
  return NextResponse.redirect(new URL(home, request.url), { status: 303 });
}
