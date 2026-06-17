import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Blog",
  description: "Editorial insights, guides, and stories from the world of equestrian excellence",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, category, cover_image, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="The LifeOnHorse Journal"
        subtitle="Thoughtful perspectives on polo heritage, breeding excellence, and the art of horsemanship from leading voices worldwide."
        image={SECTION_IMAGES.blog}
        action={{ href: "/blog/new", label: "+ Write article" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No articles yet"
          description="Share your expertise and stories with a community that values the finest in equestrian culture."
          action={<Link href="/blog/new" className="btn btn-primary">Write article</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => (
            <ListingCard
              key={item.id}
              href={`/blog/${item.id}`}
              title={item.title}
              subtitle={item.category ?? undefined}
              image={item.cover_image}
              badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={item.category ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
