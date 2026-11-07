"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function VerificationUpload({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [status, setStatus] = useState<string>("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/verification/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("uploads").upload(path, file);
    if (upErr) { setStatus("Upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
    const { error } = await supabase.from("verification_documents").insert({ user_id: user.id, entity_type: entityType, entity_id: entityId, document_url: publicUrl, document_type: file.type });
    setStatus(error ? "Save failed" : "Document submitted for review");
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold">Verification documents</h3>
      <p className="text-sm text-[var(--color-muted)]">
        Upload a business license, certification, or credential. Admins review submissions before
        granting a verified badge.
      </p>
      <input type="file" accept="image/*,.pdf" className="mt-2 text-sm" onChange={upload} />
      {status ? <p className="mt-2 text-sm">{status}</p> : null}
    </div>
  );
}
