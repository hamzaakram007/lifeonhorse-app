"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import type { EntityKind } from "@/lib/types/database";

export function ReportButton({
  entityType,
  entityId,
}: {
  entityType: EntityKind;
  entityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("reports").insert({
      reporter_id: user?.id ?? null,
      entity_type: entityType,
      entity_id: entityId,
      reason,
      details: details || null,
    });
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return <span className="text-xs text-stone-500">Report submitted</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-stone-500 underline hover:text-red-600"
      >
        Report listing
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold">Report content</h3>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Reason</Label>
                <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="spam">Spam</option>
                  <option value="fraud">Suspected fraud</option>
                  <option value="inappropriate">Inappropriate</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label>Details</Label>
                <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={submit}>Submit report</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
