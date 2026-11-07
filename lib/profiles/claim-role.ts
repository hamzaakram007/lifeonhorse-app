import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types";

/** Roles users may self-claim via claim_profile_role RPC (never admin/moderator). */
export const CLAIMABLE_ROLES = [
  "seller",
  "trainer",
  "club_owner",
  "course_creator",
] as const;

export type ClaimableRole = (typeof CLAIMABLE_ROLES)[number];

/**
 * Request a non-privileged role upgrade through the SECURITY DEFINER RPC.
 * Direct profiles.update({ role }) is blocked by migration 007.
 */
export async function claimProfileRole(
  supabase: SupabaseClient,
  targetRole: ClaimableRole
): Promise<{ role: UserRole | null; error: string | null }> {
  const { data, error } = await supabase.rpc("claim_profile_role", {
    target_role: targetRole,
  });

  if (error) {
    return { role: null, error: error.message };
  }

  return { role: (data as UserRole | null) ?? targetRole, error: null };
}
