import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";

export default async function AdminClubsPage() {
  const supabase = await createClient();
  const { data: clubs } = await supabase.from("clubs").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage clubs</h1>
      <div className="mt-4 space-y-3">
        {clubs?.map((c) => (
          <div key={c.id} className="rounded-lg border bg-white p-4">
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-stone-500">{c.club_type} · {c.status}</p>
            <AdminActions table="clubs" id={c.id} entityType="club" isFeatured={c.is_featured} isVerified={c.is_verified} status={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
