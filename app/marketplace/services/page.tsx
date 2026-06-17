import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Services",
  description: "Horse services marketplace",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("id, title, price, currency, category, photos, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Service Marketplace</h1>
          <p className="text-[var(--color-muted)]">Transport, training, grooming and more</p>
        </div>
        
      </div>
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one."  />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => (
            <ListingCard
              key={String(item.id)}
              href={`/marketplace/services/${item.id}`}
              title={String(item.title)}
              subtitle={String(item.category ?? '')}
              image={Array.isArray(item.photos) ? (item.photos as string[])[0] : null}
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={item.price ? `${item.currency ?? 'USD'} ${item.price}` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
