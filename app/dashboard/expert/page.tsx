import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function ExpertDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: requests } = expert ? await supabase.from("health_requests").select("id, horse_name, urgency, status, created_at").eq("expert_id", expert.id).order("created_at", { ascending: false }).limit(10) : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expert Dashboard</h1>
      {expert ? (
        <>
          <div className="card p-4">{expert.is_verified && <VerifiedBadge />}<h2 className="text-xl font-semibold">{expert.display_name}</h2><p>{expert.specialty}</p></div>
          <VerificationUpload entityType="expert" entityId={expert.id} />
          <section><h3 className="font-semibold">Assigned requests</h3>{requests?.map((r) => <div key={r.id} className="card mt-2 p-3 text-sm">{r.horse_name ?? "Horse"} — {r.urgency} — {r.status}</div>)}</section>
        </>
      ) : (
        <div className="card p-6"><p>Register as a health expert to receive requests.</p><Link href="/horse-health/experts/apply" className="btn btn-primary mt-4 inline-flex">Register</Link></div>
      )}
    </div>
  );
}
