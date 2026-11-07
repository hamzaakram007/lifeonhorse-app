import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { EVENT_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";

export const metadata: Metadata = {
  title: "Events",
  description: "Championships, clinics, auctions, and equestrian gatherings worldwide",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, event_type, country_code, city, photos, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Equestrian Events"
        subtitle="Polo cups, tent pegging championships, dressage galas, and exclusive clinics — the world's finest calendar awaits."
        image={SECTION_IMAGES.events}
        action={{ href: "/events/new", label: "+ List event" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No events yet"
          description="Share your competition, clinic, or gathering with riders across the globe."
          action={<Link href="/events/new" className="btn btn-primary">List event</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photos = parsePhotoList(item.photos);
            return (
              <ListingCard
                key={item.id}
                href={`/events/${item.id}`}
                title={item.title}
                subtitle={labelFromOptions(EVENT_TYPES, item.event_type) || undefined}
                image={firstPhoto(item.photos)}
                photoCount={photos.length || undefined}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={formatLocation(item.city, item.country_code)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
