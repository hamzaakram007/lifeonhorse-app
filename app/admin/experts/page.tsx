import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminExpertsPage() {
  const supabase = await createClient();
  const { data: experts } = await supabase.from("experts").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage experts</h1>
      <div className="mt-4 space-y-3">
        {experts?.map((e) => (
          <div key={e.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-sm text-stone-500">{e.category.replace(/_/g, " ")} · {e.status} · {e.country}</p>
                <div className="mt-1 flex gap-1">
                  {e.is_featured && <Badge variant="featured">Featured</Badge>}
                  {e.is_verified && <Badge variant="verified">Verified</Badge>}
                  {e.emergency_available && <Badge variant="featured">Emergency</Badge>}
                </div>
              </div>
              <AdminActions table="experts" id={e.id} isFeatured={e.is_featured} isVerified={e.is_verified} status={e.status} />
            </div>
          </div>
        ))}
        {!experts?.length && <p className="text-stone-500">No experts yet.</p>}
      </div>
    </div>
  );
}
