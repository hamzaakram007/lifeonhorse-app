"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HealthRequestAdminNotes({ requestId, initialNotes, initialStatus }: { requestId: string; initialNotes: string; initialStatus: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(false);

  async function save() {
    const supabase = createClient();
    await supabase.from("health_requests").update({ admin_notes: notes, status }).eq("id", requestId);
    setSaved(true);
  }

  return (
    <div className="mt-3 space-y-2">
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">Open</option>
        <option value="in_review">In review</option>
        <option value="assigned">Assigned</option>
        <option value="closed">Closed</option>
      </select>
      <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Admin notes..." />
      <button type="button" className="btn btn-primary text-sm py-1 px-3" onClick={save}>{saved ? "Saved" : "Save"}</button>
    </div>
  );
}
