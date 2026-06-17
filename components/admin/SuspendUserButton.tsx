"use client";

import { createClient } from "@/lib/supabase/client";

export function SuspendUserButton({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  async function toggle() {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_suspended: !isSuspended }).eq("id", userId);
    window.location.reload();
  }
  return <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={toggle}>{isSuspended ? "Unsuspend" : "Suspend"}</button>;
}
