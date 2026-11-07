import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function SellerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: seller } = await supabase.from("seller_profiles").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: horses } = seller ? await supabase.from("horses").select("id, title, status, is_featured").eq("owner_id", profile.id) : { data: [] };
  const { data: products } = seller ? await supabase.from("products").select("id, title, status").eq("seller_id", seller.id) : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      {seller ? (
        <>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">{seller.is_verified && <VerifiedBadge />}</div>
            <h2 className="text-xl font-semibold">{seller.business_name}</h2>
            <p className="text-sm text-[var(--color-muted)]">{seller.description}</p>
          </div>
          <VerificationUpload entityType="seller" entityId={seller.id} />
          <section>
            <h3 className="font-semibold">Your horses ({horses?.length ?? 0})</h3>
            <Link href="/marketplace/horses/new" className="btn btn-primary mt-2 inline-flex">+ New horse</Link>
            {horses?.length ? (
              <ul className="mt-3 space-y-2">
                {horses.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <Link href={`/marketplace/horses/${h.id}`} className="font-medium hover:underline">
                      {h.title}
                    </Link>
                    <Link href={`/marketplace/horses/${h.id}/edit`} className="text-[var(--color-primary)] hover:underline">
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
          <section>
            <h3 className="font-semibold">Products ({products?.length ?? 0})</h3>
          </section>
        </>
      ) : (
        <div className="card p-6">
          <p>Create your seller profile to start listing.</p>
          <Link href="/dashboard/seller/setup" className="btn btn-primary mt-4 inline-flex">Set up seller profile</Link>
        </div>
      )}
    </div>
  );
}
