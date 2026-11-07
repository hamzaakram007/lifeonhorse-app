import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { CLUB_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { firstPhoto } from "@/lib/storage/upload";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Elite polo clubs, riding schools, and equestrian communities worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clubs")
    .select("id, name, club_type, country_code, city, logo_url, photos, is_verified, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Equestrian Clubs"
        subtitle="From championship polo grounds to world-class riding academies — find your community among the finest clubs on earth."
        image={SECTION_IMAGES.clubs}
        action={{ href: "/clubs/register", label: "+ Register club" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No clubs listed yet"
          description="Be the first to showcase your club to a global audience of riders and enthusiasts."
          action={<Link href="/clubs/register" className="btn btn-primary">Register club</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => (
            <ListingCard
              key={item.id}
              href={`/clubs/${item.id}`}
              title={item.name}
              subtitle={labelFromOptions(CLUB_TYPES, item.club_type) || undefined}
              image={firstPhoto(item.photos) ?? item.logo_url}
              photoCount={Array.isArray(item.photos) ? item.photos.length : undefined}
              badges={
                <>
                  {item.is_verified ? <VerifiedBadge /> : null}
                  {item.is_featured ? <FeaturedBadge /> : null}
                </>
              }
              meta={formatLocation(item.city, item.country_code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
