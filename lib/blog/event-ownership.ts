import type { SupabaseClient } from "@supabase/supabase-js";

export type EventOwnershipRow = {
  id: string;
  title: string;
  host_id: string;
  club_id: string | null;
};

/** Host or owner of the event's host club may post event updates. */
export async function loadOwnedEventForUser(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
): Promise<EventOwnershipRow | null> {
  const { data: event } = await supabase
    .from("events")
    .select("id, title, host_id, club_id")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) return null;
  if (event.host_id === userId) return event;

  if (event.club_id) {
    const { data: club } = await supabase
      .from("clubs")
      .select("id")
      .eq("id", event.club_id)
      .eq("owner_id", userId)
      .maybeSingle();
    if (club) return event;
  }

  return null;
}
