import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";

export default async function AdminTrainersPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase.from("trainers").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage trainers</h1>
      <div className="mt-4 space-y-3">
        {trainers?.map((t) => (
          <div key={t.id} className="rounded-lg border bg-white p-4">
            <p className="font-medium">{t.display_name}</p>
            <AdminActions table="trainers" id={t.id} entityType="trainer" isFeatured={t.is_featured} isVerified={t.is_verified} status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
