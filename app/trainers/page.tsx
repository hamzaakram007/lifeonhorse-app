import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { humanizeSlug } from "@/lib/labels";
import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";

export const metadata: Metadata = {
  title: "Trainers",
  description: "Elite riding coaches, vets, farriers, and equestrian experts",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trainers")
    .select("id, display_name, specialty, country_code, city, photos, is_verified, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Expert Trainers"
        subtitle="Connect with Olympic-caliber coaches, master farriers, and renowned equine specialists trusted by champions."
        image={SECTION_IMAGES.trainers}
        action={{ href: "/trainers/new", label: "+ Join as trainer" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No trainers listed yet"
          description="Showcase your expertise to a discerning global audience of riders and stable owners."
          action={<Link href="/trainers/new" className="btn btn-primary">Join as trainer</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photos = parsePhotoList(item.photos);
            return (
              <ListingCard
                key={item.id}
                href={`/trainers/${item.id}`}
                title={item.display_name}
                subtitle={humanizeSlug(item.specialty) || undefined}
                image={firstPhoto(item.photos)}
                photoCount={photos.length || undefined}
                badges={
                  <>
                    {item.is_verified ? <VerifiedBadge /> : null}
                    {item.is_featured ? <FeaturedBadge /> : null}
                  </>
                }
                meta={formatLocation(item.city, item.country_code)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
