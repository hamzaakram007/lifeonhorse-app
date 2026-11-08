import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { getCountryName } from "@/lib/countries";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Seller Directory",
  description: "Verified horse sellers worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  // seller_profiles has no is_featured in live 001 schema — ordering by it empties the directory.
  const { data } = await supabase
    .from("seller_profiles")
    .select("id, business_name, city, country_code, logo_url, is_verified")
    .eq("status", "published")
    .order("is_verified", { ascending: false })
    .order("business_name", { ascending: true })
    .limit(24);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Seller Directory"
        subtitle="Find trusted sellers in your region"
        image={SECTION_IMAGES.sellers}
        action={{ href: "/dashboard/seller", label: "Create seller profile" }}
      />
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
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}</>}
              meta={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
