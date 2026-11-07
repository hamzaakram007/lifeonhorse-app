"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { featuredEntityTable } from "@/lib/featured/entity-tables";

export function FeaturedRequestActions({
  requestId,
  entityType,
  entityId,
  status,
}: {
  requestId: string;
  entityType: string;
  entityId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (status !== "pending") {
    return <span className="text-xs text-stone-500 capitalize">{status}</span>;
  }

  async function decide(next: "approved" | "rejected") {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setBusy(false);
      return;
    }

    if (next === "approved") {
      const table = featuredEntityTable(entityType);
      if (!table) {
        setError(`Unknown entity type: ${entityType}`);
        setBusy(false);
        return;
      }
      const { error: featureErr } = await supabase
        .from(table)
        .update({ is_featured: true })
        .eq("id", entityId);
      if (featureErr) {
        setError(featureErr.message);
        setBusy(false);
        return;
      }
    }

    const { error: reqErr } = await supabase
      .from("featured_listing_requests")
      .update({
        status: next,
        approved_by: next === "approved" ? user.id : null,
        approved_at: next === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", requestId);

    if (reqErr) {
      setError(reqErr.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-1">
        <Button size="sm" disabled={busy} onClick={() => decide("approved")}>
          Approve
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => decide("rejected")}>
          Reject
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
