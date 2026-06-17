import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Seller Directory",
  description: "Verified horse sellers worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("seller_profiles").select("id, business_name, city, country_code, logo_url, is_verified, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Seller Directory</h1>
          <p className="text-[var(--color-muted)]">Find trusted sellers in your region</p>
        </div>
        <Link href="/dashboard/seller" className="btn btn-primary">+ Create</Link>
      </div>
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one." action={<Link href="/dashboard/seller" className="btn btn-primary">Create</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => (
            <ListingCard
              key={String(item.id)}
              href={`/marketplace/sellers/${item.id}`}
              title={String(item.business_name)}
              subtitle={[item.city, getCountryName(item.country_code as string)].filter(Boolean).join(', ')}
              image={item.logo_url as string | null}
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
