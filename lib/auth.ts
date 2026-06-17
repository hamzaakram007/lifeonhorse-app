import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile || profile.is_suspended) {
    return null;
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();
  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    return null;
  }
  return profile;
}

export async function requireAdminOnly() {
  const profile = await requireAuth();
  if (!profile || profile.role !== "admin") {
    return null;
  }
  return profile;
}
