import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { parsePhotoList } from "@/lib/storage/upload";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Products",
  description: "Horse products and tack marketplace",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, title, price, currency, category, photos, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Product Marketplace"
        subtitle="Tack, feed, equipment and more"
        image={SECTION_IMAGES.products}
        action={{ href: "/marketplace/products/new", label: "List product" }}
      />
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one." action={<Link href="/marketplace/products/new" className="btn btn-primary">List product</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => {
            const photoList = parsePhotoList(item.photos);
            return (
            <ListingCard
              key={String(item.id)}
              href={`/marketplace/products/${item.id}`}
              title={String(item.title)}
              subtitle={String(item.category ?? '')}
              image={photoList[0] ?? null}
              photoCount={photoList.length}
              badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={item.price ? `${item.currency ?? 'USD'} ${item.price}` : undefined}
            />
          );})}
        </div>
      )}
    </div>
  );
}
