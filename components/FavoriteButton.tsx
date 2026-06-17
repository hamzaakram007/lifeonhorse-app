"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("entity_type", entityType).eq("entity_id", entityId).maybeSingle();
      setSaved(!!data);
      setLoading(false);
    })();
  }, [entityType, entityId]);

  async function toggle() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    if (saved) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("entity_type", entityType).eq("entity_id", entityId);
      setSaved(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, entity_type: entityType, entity_id: entityId });
      setSaved(true);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={loading} className="btn btn-secondary w-full">
      {saved ? "★ Saved" : "☆ Save listing"}
    </button>
  );
}
