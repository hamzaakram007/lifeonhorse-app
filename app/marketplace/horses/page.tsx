import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { getCountryName } from "@/lib/countries";
import { parsePhotoList } from "@/lib/storage/upload";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Horses for Sale",
  description: "Browse exceptional horse listings from verified breeders worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("horses")
    .select("id, title, price, currency, city, country_code, photos, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Horses for Sale"
        subtitle="Exceptional bloodlines, champion pedigrees, and trusted breeders — discover your next partner in excellence."
        image={SECTION_IMAGES.marketplace}
        action={{ href: "/marketplace/horses/new", label: "+ List horse" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No horses listed yet"
          description="Be the first to showcase your horse to discerning buyers worldwide."
          action={<Link href="/marketplace/horses/new" className="btn btn-primary">List horse</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photoList = parsePhotoList(item.photos);
            return (
              <ListingCard
                key={item.id}
                href={`/marketplace/horses/${item.id}`}
                title={item.title}
                subtitle={[item.city, getCountryName(item.country_code)].filter(Boolean).join(", ")}
                image={photoList[0] ?? null}
                photoCount={photoList.length}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={item.price ? `${item.currency ?? "USD"} ${item.price}` : "Price on request"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
