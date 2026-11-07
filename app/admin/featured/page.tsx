import { createClient } from "@/lib/supabase/server";
import { FeaturedRequestActions } from "@/components/admin/FeaturedRequestActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminFeaturedRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("featured_listing_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Featured listing requests</h1>
      <p className="mt-1 text-sm text-stone-600">
        Approve to set <code className="text-xs">is_featured</code> on the listing. Payments stay
        manual until a provider is locked.
      </p>
      <div className="mt-4 space-y-3">
        {!requests?.length ? (
          <p className="text-sm text-stone-500">No featured requests yet.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium capitalize">
                    {r.entity_type} · <span className="font-mono text-xs">{r.entity_id}</span>
                  </p>
                  <p className="text-sm text-stone-500">
                    {r.duration_days ?? 30} days
                    {r.amount != null ? ` · ${r.currency ?? "USD"} ${r.amount}` : ""}
                    {" · "}
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                  </p>
                  <div className="mt-1">
                    <Badge variant={r.status === "approved" ? "featured" : "default"}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
                <FeaturedRequestActions
                  requestId={r.id}
                  entityType={r.entity_type}
                  entityId={r.entity_id}
                  status={r.status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
