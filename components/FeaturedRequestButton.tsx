"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function FeaturedRequestButton({
  entityType,
  entityId,
  isFeatured,
  hasPending,
}: {
  entityType: string;
  entityId: string;
  isFeatured?: boolean;
  hasPending?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(hasPending ? "pending" : "");
  const [loading, setLoading] = useState(false);

  if (isFeatured) {
    return <span className="text-xs font-medium text-amber-800">Featured</span>;
  }

  if (status === "pending" || hasPending) {
    return <span className="text-xs text-[var(--color-muted)]">Feature request pending</span>;
  }

  async function requestFeature() {
    setLoading(true);
    setStatus("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("featured_listing_requests").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      duration_days: 30,
      amount: 29,
      currency: "USD",
      status: "pending",
    });

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    setStatus("pending");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" disabled={loading} onClick={requestFeature}>
        {loading ? "Requesting…" : "Request featured"}
      </Button>
      <Link href="/payments" className="text-[10px] text-[var(--color-muted)] hover:underline">
        Payment guidance
      </Link>
      {status && status !== "pending" ? (
        <p className="max-w-[12rem] text-right text-[10px] text-red-600">{status}</p>
      ) : null}
    </div>
  );
}
