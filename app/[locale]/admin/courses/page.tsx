import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, category, is_free, is_featured")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage courses</h1>
      <div className="mt-4 space-y-3">
        {!courses?.length ? (
          <p className="text-sm text-stone-500">No courses.</p>
        ) : (
          courses.map((c) => (
            <div key={c.id} className="rounded-lg border bg-white p-4">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-stone-500">
                    {c.status}
                    {c.category ? ` · ${c.category}` : ""}
                    {` · ${c.is_free ? "Free" : "Paid"}`}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {c.is_featured ? <Badge variant="featured">Featured</Badge> : null}
                  </div>
                </div>
                <AdminActions
                  table="courses"
                  id={c.id}
                  entityType="course"
                  isFeatured={c.is_featured}
                  status={c.status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
