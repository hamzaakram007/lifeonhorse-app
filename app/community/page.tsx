import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Community",
  description: "Stories, galleries, and conversations from riders around the world",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_posts")
    .select("id, title, content, photos")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Global Community"
        subtitle="Celebrate the bond between horse and rider — share moments, stories, and inspiration with fellow enthusiasts worldwide."
        image={SECTION_IMAGES.community}
        action={{ href: "/community/new", label: "+ Share story" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No community posts yet"
          description="Be the first to share your equestrian journey with riders across the globe."
          action={<Link href="/community/new" className="btn btn-primary">Share story</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => (
            <ListingCard
              key={item.id}
              href={`/community/${item.id}`}
              title={item.title}
              subtitle={item.content?.slice(0, 100) ?? undefined}
              image={Array.isArray(item.photos) ? item.photos[0] : null}
              photoCount={Array.isArray(item.photos) ? item.photos.length : undefined}
              badges={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
