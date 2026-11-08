import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";
import { FeaturedRequestButton } from "@/components/FeaturedRequestButton";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export default async function ExpertDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/expert");
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("user_id", profile.id).maybeSingle();
  const [{ data: requests }, { data: pendingFeatured }, tipsResult] = expert
    ? await Promise.all([
        supabase
          .from("health_requests")
          .select("id, horse_name, urgency, status, created_at")
          .eq("expert_id", expert.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("featured_listing_requests")
          .select("entity_type, entity_id")
          .eq("user_id", profile.id)
          .eq("status", "pending"),
        supabase
          .from("blog_posts")
          .select("id, title, status, published_at, category")
          .eq("linked_entity_type", "expert")
          .eq("linked_entity_id", expert.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])
    : [{ data: [] }, { data: [] }, { data: [], error: null }];

  const pendingKey = new Set(
    (pendingFeatured ?? []).map((r) => `${r.entity_type}:${r.entity_id}`)
  );
  const tips = isMissingLinkedEntityColumn(tipsResult.error) ? [] : tipsResult.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Expert dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Assigned horse-health requests and Journal tips.
        </p>
      </div>
      {expert ? (
        <>
          <div className="card space-y-1 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>{expert.is_verified ? <VerifiedBadge /> : null}</div>
              <FeaturedRequestButton
                entityType="expert"
                entityId={expert.id}
                isFeatured={Boolean(expert.is_featured)}
                hasPending={pendingKey.has(`expert:${expert.id}`)}
              />
            </div>
            <h2 className="text-xl font-semibold">{expert.display_name}</h2>
            <p className="text-sm text-[var(--color-muted)]">{expert.specialty}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/horse-health/experts/${expert.id}`}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                View public profile
              </Link>
              <Link
                href={`/blog/new?expert=${expert.id}&category=health`}
                className="btn btn-primary inline-flex text-sm"
              >
                Write a tip
              </Link>
            </div>
          </div>
          <VerificationUpload entityType="expert" entityId={expert.id} />
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Your health tips ({tips.length})</h3>
              <Link
                href={`/blog/new?expert=${expert.id}&category=health`}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                + Write a tip
              </Link>
            </div>
            {!tips.length ? (
              <p className="text-sm text-[var(--color-muted)]">
                No Journal tips linked to your expert profile yet. Share educational guidance —
                readers see a health disclaimer; patients are never auto-notified.
              </p>
            ) : (
              tips.map((tip) => (
                <div key={tip.id} className="card p-3 text-sm">
                  <Link href={`/blog/${tip.id}`} className="font-medium hover:underline">
                    {tip.title}
                  </Link>
                  <p className="text-[var(--color-muted)]">
                    {[
                      tip.status,
                      tip.category,
                      tip.published_at
                        ? new Date(tip.published_at).toLocaleDateString()
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))
            )}
          </section>
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
          description="Create an expert profile to receive health requests and publish tips."
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
