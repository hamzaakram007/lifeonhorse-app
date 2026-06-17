import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Horses for Sale",
  description: "Browse horse listings worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("horses").select("id, title, price, currency, city, country_code, photos, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Horse Marketplace</h1>
          <p className="text-[var(--color-muted)]">Sale, adoption, stud, lease, and wanted listings</p>
        </div>
        <Link href="/marketplace/horses/new" className="btn btn-primary">+ Create</Link>
      </div>
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one." action={<Link href="/marketplace/horses/new" className="btn btn-primary">Create</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => (
            <ListingCard
              key={String(item.id)}
              href={`/marketplace/horses/${item.id}`}
              title={String(item.title)}
              subtitle={[item.city, getCountryName(item.country_code as string)].filter(Boolean).join(', ')}
              image={Array.isArray(item.photos) ? (item.photos as string[])[0] : null}
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={item.price ? `${item.currency ?? 'USD'} ${item.price}` : 'Price on request'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
