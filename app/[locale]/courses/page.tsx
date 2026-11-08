import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  const heroT = await getTranslations("Heroes.courses");
  const commonT = await getTranslations("Common");
  const emptyT = await getTranslations("Empty");

  return (
    <div className="space-y-8">
      <SectionHero
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        image={SECTION_IMAGES.courses}
        action={{ href: "/courses/new", label: `+ ${commonT("createCourse")}` }}
      />
      {!data?.length ? (
        <EmptyState
          title={emptyT("noCourses")}
          description={emptyT("coursesDesc")}
          action={
            <Link href="/courses/new" className="btn btn-primary">
              {commonT("createCourse")}
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
                badges={
                  <>
                    {item.is_featured ? <FeaturedBadge /> : null}
                    <span className="badge">{item.is_free ? commonT("free") : commonT("paid")}</span>
                  </>
                }
                meta={item.is_free ? commonT("openAccess") : commonT("checkoutLater")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
