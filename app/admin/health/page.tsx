import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HealthRequestAdminNotes } from "@/components/admin/HealthRequestAdminNotes";

export default async function AdminHealthPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("health_requests").select("*").order("created_at", { ascending: false }).limit(30);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Health Requests</h1>
      {data?.map((r) => (
        <div key={r.id} className="card p-4">
          <p className="font-medium">{r.horse_name ?? "Unnamed horse"} — {r.urgency} — {r.status}</p>
          <p className="text-sm">{r.issue_description}</p>
          {r.video_url && <a href={r.video_url} className="text-sm">View video</a>}
          <HealthRequestAdminNotes requestId={r.id} initialNotes={r.admin_notes ?? ""} initialStatus={r.status} />
        </div>
      ))}
    </div>
  );
}
