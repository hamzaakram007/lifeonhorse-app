import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { OwnedList } from "@/components/dashboard/OwnedList";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";
import { FeaturedRequestButton } from "@/components/FeaturedRequestButton";

export default async function TrainerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/trainer");

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const [{ data: courses }, { data: pendingFeatured }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, status, level, category, is_free, is_featured")
      .eq("creator_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("featured_listing_requests")
      .select("entity_type, entity_id")
      .eq("user_id", profile.id)
      .eq("status", "pending"),
  ]);

  const pendingKey = new Set(
    (pendingFeatured ?? []).map((r) => `${r.entity_type}:${r.entity_id}`)
  );

  const courseItems =
    courses?.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      href: `/courses/${c.id}`,
      meta: [c.category, c.level, c.is_free ? "free" : "paid"].filter(Boolean).join(" · ") || null,
      featureEntityType: "course",
      isFeatured: Boolean(c.is_featured),
      featurePending: pendingKey.has(`course:${c.id}`),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Trainer dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Your trainer profile and courses you created.
        </p>
      </div>

      {trainer ? (
        <>
          <div className="card space-y-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {trainer.is_verified ? <VerifiedBadge /> : null}
              </div>
              <FeaturedRequestButton
                entityType="trainer"
                entityId={trainer.id}
                isFeatured={Boolean(trainer.is_featured)}
                hasPending={pendingKey.has(`trainer:${trainer.id}`)}
              />
            </div>
            <h2 className="text-xl font-semibold">{trainer.display_name}</h2>
            {trainer.specialty ? (
              <p className="text-sm text-[var(--color-muted)]">{trainer.specialty}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href={`/trainers/${trainer.id}`} className="text-[var(--color-primary)] hover:underline">
                View public profile
              </Link>
              <span className="text-[var(--color-muted)]">Status: {trainer.status}</span>
            </div>
          </div>
          <VerificationUpload entityType="trainer" entityId={trainer.id} />
        </>
      ) : (
        <EmptyState
          title="No trainer profile"
          description="Create a trainer profile to appear in the directory."
          action={
            <Link href="/trainers/new" className="btn btn-primary">
              Create trainer profile
            </Link>
          }
        />
      )}

      <OwnedList
        title="Your courses"
        items={courseItems}
        createHref="/courses/new"
        createLabel="+ New course"
        emptyDescription="You have not created any courses yet."
      />
    </div>
  );
}
