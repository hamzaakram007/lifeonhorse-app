import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui";

export async function ReviewsSection({ entityType, entityId }: { entityType: string; entityId: string }) {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, title, content, created_at, profiles(full_name)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!reviews?.length) {
    return <EmptyState title="No reviews yet" description="Be the first to leave a review." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Reviews</h2>
      {reviews.map((r) => (
        <div key={r.id} className="card p-4">
          <p className="font-medium">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
          {r.title && <p className="font-semibold">{r.title}</p>}
          <p className="text-sm">{r.content}</p>
        </div>
      ))}
    </section>
  );
}
