import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage community</h1>
      <p className="mt-1 text-sm text-stone-600">
        Hide or remove posts. Featured placement for community needs a schema column (deferred).
      </p>
      <div className="mt-4 space-y-3">
        {!posts?.length ? (
          <p className="text-sm text-stone-500">No posts.</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="rounded-lg border bg-white p-4">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-stone-500">
                    {p.status}
                    {p.created_at ? ` · ${new Date(p.created_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <AdminActions table="community_posts" id={p.id} status={p.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
