import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, status, category, is_featured")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage blog</h1>
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
                    {p.category ? ` · ${p.category}` : ""}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {p.is_featured ? <Badge variant="featured">Featured</Badge> : null}
                  </div>
                </div>
                <AdminActions
                  table="blog_posts"
                  id={p.id}
                  entityType="blog_post"
                  isFeatured={p.is_featured}
                  status={p.status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
