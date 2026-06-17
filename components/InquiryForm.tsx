"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function InquiryForm({ recipientId, entityType, entityId }: { recipientId: string; entityType: string; entityId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const { error } = await supabase.from("inquiries").insert({ sender_id: user.id, recipient_id: recipientId, entity_type: entityType, entity_id: entityId, message });
    setStatus(error ? "error" : "done");
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h3 className="font-semibold">Send inquiry</h3>
      <textarea className="input min-h-24" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." />
      <button type="submit" className="btn btn-primary w-full" disabled={status === "loading" || status === "done"}>
        {status === "done" ? "Sent!" : status === "loading" ? "Sending..." : "Send inquiry"}
      </button>
      {status === "error" && <p className="text-sm text-[var(--color-danger)]">Failed to send. Try again.</p>}
    </form>
  );
}
