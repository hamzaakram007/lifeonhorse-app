import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("analytics_counts").select("*").single();
  const entries = data ? Object.entries(data).filter(([k]) => k !== "undefined") : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="card p-4"><p className="text-sm capitalize text-[var(--color-muted)]">{key.replace(/_/g, " ")}</p><p className="text-2xl font-bold">{String(value)}</p></div>
        ))}
      </div>
    </div>
  );
}
