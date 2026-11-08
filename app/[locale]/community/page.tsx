import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { parseCommunityShareMeta } from "@/lib/community/dual-publish";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Community",
  description: "Stories, galleries, and conversations from riders around the world",
};

export default async function Page() {
  const heroT = await getTranslations("Heroes.community");
  const commonT = await getTranslations("Common");
  const emptyT = await getTranslations("Empty");
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_posts")
    .select("id, title, content, photos")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-8">
      <SectionHero
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        image={SECTION_IMAGES.community}
        action={{ href: "/community/new", label: `+ ${commonT("shareStory")}` }}
      />
      {!data?.length ? (
        <EmptyState
          title={emptyT("noCommunity")}
          description={emptyT("noCommunityDesc")}
          action={
            <Link href="/community/new" className="btn btn-primary">
              {commonT("shareStory")}
            </Link>
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const share = parseCommunityShareMeta(item.content);
            const excerpt = (share.body || "").trim().slice(0, 100) || undefined;
            return (
              <ListingCard
                key={item.id}
                href={`/community/${item.id}`}
                title={item.title}
                subtitle={excerpt}
                image={Array.isArray(item.photos) ? item.photos[0] : null}
                photoCount={Array.isArray(item.photos) ? item.photos.length : undefined}
                badges={undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
