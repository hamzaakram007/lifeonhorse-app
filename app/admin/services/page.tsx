import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*, seller_profiles(business_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage services</h1>
      <div className="mt-4 space-y-3">
        {services?.map((s) => (
          <div key={s.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-stone-500">
                  {s.seller_profiles?.business_name} · {s.category} · {s.status}
                </p>
                <div className="mt-1 flex gap-1">
                  {s.is_featured && <Badge variant="featured">Featured</Badge>}
                </div>
              </div>
              <AdminActions table="services" id={s.id} isFeatured={s.is_featured} status={s.status} />
            </div>
          </div>
        ))}
        {!services?.length && <p className="text-stone-500">No services yet.</p>}
      </div>
    </div>
  );
}
