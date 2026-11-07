import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function ExpertDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/expert");
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: requests } = expert
    ? await supabase
        .from("health_requests")
        .select("id, horse_name, urgency, status, created_at")
        .eq("expert_id", expert.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Expert dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">Assigned horse-health requests.</p>
      </div>
      {expert ? (
        <>
          <div className="card space-y-1 p-4">
            {expert.is_verified ? <VerifiedBadge /> : null}
            <h2 className="text-xl font-semibold">{expert.display_name}</h2>
            <p className="text-sm text-[var(--color-muted)]">{expert.specialty}</p>
            <Link
              href={`/horse-health/experts/${expert.id}`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              View public profile
            </Link>
          </div>
          <VerificationUpload entityType="expert" entityId={expert.id} />
          <section className="space-y-2">
            <h3 className="font-semibold">Assigned requests ({requests?.length ?? 0})</h3>
            {!requests?.length ? (
              <p className="text-sm text-[var(--color-muted)]">No requests assigned yet.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="card p-3 text-sm">
                  <p className="font-medium">{r.horse_name ?? "Horse"}</p>
                  <p className="text-[var(--color-muted)]">
                    {[r.urgency, r.status, r.created_at ? new Date(r.created_at).toLocaleDateString() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Register as a health expert"
          description="Create an expert profile to receive health requests."
          action={
            <Link href="/horse-health/experts/apply" className="btn btn-primary">
              Register
            </Link>
          }
        />
      )}
    </div>
  );
}
