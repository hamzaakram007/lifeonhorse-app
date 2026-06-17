"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { EntityKind } from "@/lib/types/database";

export function AdminActions({
  table,
  id,
  entityType,
  isFeatured,
  isVerified,
  status,
}: {
  table: string;
  id: string;
  entityType?: EntityKind;
  isFeatured?: boolean;
  isVerified?: boolean;
  status?: string;
}) {
  const router = useRouter();

  async function update(fields: Record<string, unknown>) {
    const supabase = createClient();
    await supabase.from(table).update(fields).eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button size="sm" variant="outline" onClick={() => update({ is_featured: !isFeatured })}>
        {isFeatured ? "Unfeature" : "Feature"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => update({ is_verified: !isVerified })}>
        {isVerified ? "Unverify" : "Verify"}
      </Button>
      {status === "published" && (
        <Button size="sm" variant="danger" onClick={() => update({ status: "hidden" })}>Hide</Button>
      )}
      {status === "hidden" && (
        <Button size="sm" onClick={() => update({ status: "published" })}>Restore</Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => update({ status: "removed" })}>Remove</Button>
    </div>
  );
}
