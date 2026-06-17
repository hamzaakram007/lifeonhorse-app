import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminHorsesPage() {
  const supabase = await createClient();
  const { data: horses } = await supabase.from("horses").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage horses</h1>
      <div className="mt-4 space-y-3">
        {horses?.map((h) => (
          <div key={h.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{h.title}</p>
                <p className="text-sm text-stone-500">{h.status} · {h.country}</p>
                <div className="mt-1 flex gap-1">
                  {h.is_featured && <Badge variant="featured">Featured</Badge>}
                  {h.is_verified && <Badge variant="verified">Verified</Badge>}
                </div>
              </div>
              <AdminActions table="horses" id={h.id} entityType="horse" isFeatured={h.is_featured} isVerified={h.is_verified} status={h.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
