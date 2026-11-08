import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("id, email, full_name, role, is_suspended, created_at").order("created_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      {users?.map((u) => (
        <div key={u.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
          <div><p className="font-medium">{u.full_name ?? u.email}</p><p className="text-sm text-[var(--color-muted)]">{u.role}{u.is_suspended ? " · SUSPENDED" : ""}</p></div>
          <SuspendUserButton userId={u.id} isSuspended={u.is_suspended} />
        </div>
      ))}
    </div>
  );
}
