import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportActions } from "@/components/admin/ReportActions";
import { EmptyState } from "@/components/ui";

export default async function AdminReportsPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports Queue</h1>
      {!reports?.length ? <EmptyState title="No reports" /> : reports.map((r) => (
        <div key={r.id} className="card p-4">
          <p className="text-xs text-[var(--color-muted)]">{r.entity_type} · {r.status}</p>
          <p className="font-medium">{r.reason}</p>
          <p className="text-sm">{r.details}</p>
          <ReportActions reportId={r.id} entityType={r.entity_type} entityId={r.entity_id} />
        </div>
      ))}
    </div>
  );
}
