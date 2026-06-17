import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export default async function FavoritesPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved listings</h1>
      {!data?.length ? <EmptyState title="No saved listings" action={<Link href="/marketplace" className="btn btn-primary">Browse marketplace</Link>} /> : (
        <ul className="space-y-2">
          {data.map((f) => (
            <li key={f.id} className="card p-3">
              <Link href={`/${f.entity_type === "horse" ? "marketplace/horses" : f.entity_type}s/${f.entity_id}`}>{f.entity_type} — view</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
