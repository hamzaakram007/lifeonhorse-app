import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { getCountryName } from "@/lib/countries";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Seller Directory",
  description: "Verified horse sellers worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("seller_profiles").select("id, business_name, city, country_code, logo_url, is_verified, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

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
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
