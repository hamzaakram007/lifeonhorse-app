"use client";

import { createClient } from "@/lib/supabase/client";

export function ReportActions({ reportId, entityType, entityId }: { reportId: string; entityType: string; entityId: string }) {
  async function resolve(status: string) {
    const supabase = createClient();
    await supabase.from("reports").update({ status, resolved_at: new Date().toISOString() }).eq("id", reportId);
    window.location.reload();
  }

  return (
    <div className="mt-3 flex gap-2">
      <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={() => resolve("resolved")}>Resolve</button>
      <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={() => resolve("dismissed")}>Dismiss</button>
    </div>
  );
}
