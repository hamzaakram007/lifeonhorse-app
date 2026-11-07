import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { EmptyState } from "@/components/ui";
import { ReviewForm } from "@/components/ReviewForm";

export async function ReviewsSection({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: reviews }, existingReview] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, title, content, created_at, reviewer_id, profiles(full_name)")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10),
    profile
      ? supabase
          .from("reviews")
          .select("id")
          .eq("entity_type", entityType)
          .eq("entity_id", entityId)
          .eq("reviewer_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const alreadyReviewed = Boolean(existingReview.data?.id);
  const entityPathByType: Record<string, string> = {
    club: `/clubs/${entityId}`,
    trainer: `/trainers/${entityId}`,
    expert: `/horse-health/experts/${entityId}`,
    seller: `/marketplace/sellers/${entityId}`,
    product: `/marketplace/products/${entityId}`,
    service: `/marketplace/services/${entityId}`,
  };
  const loginHref = `/auth/login?redirect=${encodeURIComponent(entityPathByType[entityType] ?? "/")}`;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Reviews</h2>

      {profile && !profile.is_suspended && !alreadyReviewed ? (
        <ReviewForm entityType={entityType} entityId={entityId} />
      ) : null}

      {profile && alreadyReviewed ? (
        <p className="text-sm text-[var(--color-muted)]">You already left a review for this listing.</p>
      ) : null}

      {!profile ? (
        <p className="text-sm text-[var(--color-muted)]">
          <Link href={loginHref} className="text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      ) : null}

      {!reviews?.length ? (
        <EmptyState title="No reviews yet" description="Be the first to leave a review." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const author =
              r.profiles && typeof r.profiles === "object" && "full_name" in r.profiles
                ? (r.profiles as { full_name: string | null }).full_name
                : null;
            return (
              <div key={r.id} className="card p-4">
                <p className="font-medium">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                {r.title ? <p className="font-semibold">{r.title}</p> : null}
                {r.content ? <p className="text-sm">{r.content}</p> : null}
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {author ?? "Member"}
                  {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
