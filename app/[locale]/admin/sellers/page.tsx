import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminSellersPage() {
  const supabase = await createClient();
  const { data: sellers } = await supabase
    .from("seller_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage sellers</h1>
      <div className="mt-4 space-y-3">
        {sellers?.map((s) => (
          <div key={s.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{s.business_name}</p>
                <p className="text-sm text-stone-500">{s.status} · {s.country_code} · {s.city}</p>
                <div className="mt-1 flex gap-1">
                  {s.is_verified && <Badge variant="verified">Verified</Badge>}
                </div>
              </div>
              <AdminActions table="seller_profiles" id={s.id} isVerified={s.is_verified} status={s.status} />
            </div>
          </div>
        ))}
        {!sellers?.length && <p className="text-stone-500">No sellers yet.</p>}
      </div>
    </div>
  );
}
