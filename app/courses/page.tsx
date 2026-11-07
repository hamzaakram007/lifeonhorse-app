import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { COURSE_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Courses",
  description: "Master horsemanship, stable management, and equestrian business skills",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, category, cover_image, is_featured")
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
          action={<Link href="/courses/new" className="btn btn-primary">Create course</Link>}
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => (
            <ListingCard
              key={item.id}
              href={`/courses/${item.id}`}
              title={item.title}
              subtitle={labelFromOptions(COURSE_CATEGORIES, item.category) || undefined}
              image={item.cover_image}
              badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
