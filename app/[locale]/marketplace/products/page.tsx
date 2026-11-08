import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveProductCover, resolveProductPhotos } from "@/lib/product-covers";

export const metadata: Metadata = {
  title: "Products",
  description: "Horse products and tack marketplace",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, price, currency, category, photos, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(36);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Product Marketplace"
        subtitle="Tack, feed, equipment and more"
        image={SECTION_IMAGES.products}
        action={{ href: "/marketplace/products/new", label: "List product" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No listings yet"
          description="Be the first to add one."
          action={
            <Link href="/marketplace/products/new" className="btn btn-primary">
              List product
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => {
            const id = String(item.id);
            const title = String(item.title);
            const photos = resolveProductPhotos(id, title, item.photos);
            return (
              <ListingCard
                key={id}
                href={`/marketplace/products/${id}`}
                title={title}
                subtitle={labelFromOptions(PRODUCT_CATEGORIES, String(item.category ?? ""))}
                image={resolveProductCover(id, title, item.photos)}
                photoCount={photos.length}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={item.price ? `${item.currency ?? "USD"} ${item.price}` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
