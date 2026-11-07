import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, status, country_code, start_date, is_featured")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage events</h1>
      <div className="mt-4 space-y-3">
        {!events?.length ? (
          <p className="text-sm text-stone-500">No events.</p>
        ) : (
          events.map((e) => (
            <div key={e.id} className="rounded-lg border bg-white p-4">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-stone-500">
                    {e.status}
                    {e.country_code ? ` · ${e.country_code}` : ""}
                    {e.start_date ? ` · ${new Date(e.start_date).toLocaleDateString()}` : ""}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {e.is_featured ? <Badge variant="featured">Featured</Badge> : null}
                  </div>
                </div>
                <AdminActions
                  table="events"
                  id={e.id}
                  entityType="event"
                  isFeatured={e.is_featured}
                  status={e.status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
