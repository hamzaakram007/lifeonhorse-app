import { createClient } from "@/lib/supabase/server";
import { localeFromPath } from "@/lib/auth-redirect";
import { withLocalePrefix } from "@/lib/i18n-path";
import { NextResponse } from "next/server";

function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost.split(",")[0]!.trim()}`;
  }
  return url.origin;
}

function homeRedirect(request: Request) {
  const referer = request.headers.get("referer");
  let locale = "en";
  try {
    if (referer) {
      locale = localeFromPath(new URL(referer).pathname);
    } else {
      locale = localeFromPath(new URL(request.url).pathname);
    }
  } catch {
    /* ignore bad referer */
  }

  const home = withLocalePrefix("/", locale);
  return NextResponse.redirect(new URL(home, requestOrigin(request)), {
    status: 303,
  });
}

async function signOutAndRedirect(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return homeRedirect(request);
}

/** Form POST (legacy) and accidental navigations both land on a real home page. */
export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
