import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { SECTION_IMAGES } from "@/lib/section-images";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveBlogCover } from "@/lib/blog-covers";
import { escapeIlike } from "@/lib/filters/escape-ilike";
import {
  hasActiveBlogFilters,
  normalizeBlogSearchParams,
  type BlogSearchParams,
} from "@/lib/blog/blog-filters";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export const metadata: Metadata = {
  title: "Blog",
  description: "Editorial insights, guides, and stories from the world of equestrian excellence",
};

type ClubChip = { id: string; name: string };
type BlogListRow = {
  id: string;
  title: string;
  category: string | null;
  cover_image: string | null;
  is_featured: boolean;
  linked_entity_type?: string | null;
  linked_entity_id?: string | null;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const filters = normalizeBlogSearchParams(await searchParams);
  const supabase = await createClient();
  const active = hasActiveBlogFilters(filters);
  const wantsEntityFilter = Boolean(filters.club || filters.entity_type === "club");

  let query = supabase
    .from("blog_posts")
    .select(
      "id, title, category, cover_image, is_featured, linked_entity_type, linked_entity_id"
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(24);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.club) {
    query = query.eq("linked_entity_type", "club").eq("linked_entity_id", filters.club);
  } else if (filters.entity_type === "club") {
    query = query.eq("linked_entity_type", "club");
  }
  if (filters.q) {
    const q = escapeIlike(filters.q.replace(/,/g, " "));
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const first = await query;
  let data = (first.data ?? []) as BlogListRow[];

  // Until 008_blog_entity_links is applied, fall back so the Journal still lists.
  if (isMissingLinkedEntityColumn(first.error)) {
    if (wantsEntityFilter) {
      data = [];
    } else {
      let fallback = supabase
        .from("blog_posts")
        .select("id, title, category, cover_image, is_featured")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(24);
      if (filters.category) fallback = fallback.eq("category", filters.category);
      if (filters.featured) fallback = fallback.eq("is_featured", true);
      if (filters.q) {
        const q = escapeIlike(filters.q.replace(/,/g, " "));
        fallback = fallback.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);
      }
      const retry = await fallback;
      data = (retry.data ?? []) as BlogListRow[];
    }
  }

  const clubIds = [
    ...new Set(
      data
        .filter((p) => p.linked_entity_type === "club" && p.linked_entity_id)
        .map((p) => p.linked_entity_id as string)
    ),
  ];
  const clubMap = new Map<string, ClubChip>();
  if (clubIds.length) {
    const { data: clubs } = await supabase.from("clubs").select("id, name").in("id", clubIds);
    for (const c of clubs ?? []) clubMap.set(c.id, c);
  }

  return (
    <div className="space-y-8">
      <SectionHero
        title="The LifeOnHorse Journal"
        subtitle="Thoughtful perspectives on polo heritage, breeding excellence, and the art of horsemanship from leading voices worldwide."
        image={SECTION_IMAGES.blog}
        action={{ href: "/blog/new", label: "+ Write article" }}
      />

      <FilterBar
        action="/blog"
        clearHref="/blog"
        values={{
          category: filters.category,
          entity_type: filters.entity_type,
          featured: filters.featured,
          q: filters.q,
          club: filters.club,
        }}
        fields={[
          {
            kind: "select",
            name: "category",
            options: BLOG_CATEGORIES,
            allLabel: "All categories",
          },
          {
            kind: "select",
            name: "entity_type",
            options: [{ value: "club", label: "Club updates" }],
            allLabel: "All posts",
          },
          {
            kind: "select",
            name: "featured",
            options: [{ value: "1", label: "Featured only" }],
            allLabel: "All visibility",
          },
          { kind: "text", name: "q", placeholder: "Search articles…" },
        ]}
      />

      {!data.length ? (
        <EmptyState
          title={active ? "No articles match these filters" : "No articles yet"}
          description={
            active
              ? filters.club
                ? "No published updates from this club yet."
                : "Try clearing filters or broadening your search."
              : "Share your expertise and stories with a community that values the finest in equestrian culture."
          }
          action={
            active ? (
              filters.club ? (
                <Link href={`/blog/new?club=${filters.club}`} className="btn btn-primary">
                  Write club update
                </Link>
              ) : (
                <Link href="/blog" className="btn btn-secondary">
                  Clear filters
                </Link>
              )
            ) : (
              <Link href="/blog/new" className="btn btn-primary">
                Write article
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const categoryLabel = labelFromOptions(BLOG_CATEGORIES, item.category) || undefined;
            const club =
              item.linked_entity_type === "club" && item.linked_entity_id
                ? clubMap.get(item.linked_entity_id)
                : undefined;
            return (
              <ListingCard
                key={item.id}
                href={`/blog/${item.id}`}
                title={item.title}
                subtitle={
                  club ? `${categoryLabel ?? "Update"} · ${club.name}` : categoryLabel
                }
                image={resolveBlogCover(item.title, item.cover_image)}
                badges={
                  <>
                    {item.is_featured ? <FeaturedBadge /> : null}
                    {item.linked_entity_type === "club" ? (
                      <span className="badge">Club update</span>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
