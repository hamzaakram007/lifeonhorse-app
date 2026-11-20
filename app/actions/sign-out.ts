"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Locale-aware sign-out used by the header form.
 * Prefer this over POSTing /auth/signout so next-intl never treats logout as a page route.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: "/", locale });
}
