import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Courses",
  description: "Master horsemanship, stable management, and equestrian business skills",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, category, level, cover_image, is_featured, is_free")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Equestrian Academy"
        subtitle="From foundational riding to advanced stable management — curated courses taught by the industry's finest minds."
        image={SECTION_IMAGES.courses}
        action={{ href: "/courses/new", label: "+ Create course" }}
      />
      {!data?.length ? (
        <EmptyState
          title="No courses yet"
          description="Share your knowledge and build your reputation among serious equestrians worldwide."
          action={
            <Link href="/courses/new" className="btn btn-primary">
              Create course
            </Link>
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const category = labelFromOptions(COURSE_CATEGORIES, item.category);
            const level = labelFromOptions(COURSE_LEVELS, item.level);
            return (
              <ListingCard
                key={item.id}
                href={`/courses/${item.id}`}
                title={item.title}
                subtitle={[category, level].filter(Boolean).join(" · ") || undefined}
                image={item.cover_image}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={item.is_free ? "Free" : "Paid"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
