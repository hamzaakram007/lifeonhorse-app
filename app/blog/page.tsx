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
import {
  linkedEntityBadgeLabel,
  linkedEntityFilterLabel,
} from "@/lib/blog/linked-entity";

export const metadata: Metadata = {
  title: "Blog",
  description: "Editorial insights, guides, and stories from the world of equestrian excellence",
};

type EntityChip = { id: string; name: string };
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
  const entityIdFilter =
    filters.club || filters.trainer || filters.course || filters.expert;
  const entityTypeFilter = filters.club
    ? "club"
    : filters.trainer
      ? "trainer"
      : filters.course
        ? "course"
        : filters.expert
          ? "expert"
          : filters.entity_type;
  const wantsEntityFilter = Boolean(entityIdFilter || entityTypeFilter);

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
  if (entityTypeFilter) {
    query = query.eq("linked_entity_type", entityTypeFilter);
    if (entityIdFilter) query = query.eq("linked_entity_id", entityIdFilter);
  }
  if (filters.q) {
    const q = escapeIlike(filters.q.replace(/,/g, " "));
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const first = await query;
  let data = (first.data ?? []) as BlogListRow[];

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
  const trainerIds = [
    ...new Set(
      data
        .filter((p) => p.linked_entity_type === "trainer" && p.linked_entity_id)
        .map((p) => p.linked_entity_id as string)
    ),
  ];
  const courseIds = [
    ...new Set(
      data
        .filter((p) => p.linked_entity_type === "course" && p.linked_entity_id)
        .map((p) => p.linked_entity_id as string)
    ),
  ];
  const expertIds = [
    ...new Set(
      data
        .filter((p) => p.linked_entity_type === "expert" && p.linked_entity_id)
        .map((p) => p.linked_entity_id as string)
    ),
  ];

  const clubMap = new Map<string, EntityChip>();
  const trainerMap = new Map<string, EntityChip>();
  const courseMap = new Map<string, EntityChip>();
  const expertMap = new Map<string, EntityChip>();

  await Promise.all([
    clubIds.length
      ? supabase
          .from("clubs")
          .select("id, name")
          .in("id", clubIds)
          .then(({ data: clubs }) => {
            for (const c of clubs ?? []) clubMap.set(c.id, c);
          })
      : Promise.resolve(),
    trainerIds.length
      ? supabase
          .from("trainers")
          .select("id, display_name")
          .in("id", trainerIds)
          .then(({ data: trainers }) => {
            for (const t of trainers ?? []) {
              trainerMap.set(t.id, { id: t.id, name: t.display_name });
            }
          })
      : Promise.resolve(),
    courseIds.length
      ? supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds)
          .then(({ data: courses }) => {
            for (const c of courses ?? []) {
              courseMap.set(c.id, { id: c.id, name: c.title });
            }
          })
      : Promise.resolve(),
    expertIds.length
      ? supabase
          .from("experts")
          .select("id, display_name")
          .in("id", expertIds)
          .then(({ data: experts }) => {
            for (const e of experts ?? []) {
              expertMap.set(e.id, { id: e.id, name: e.display_name });
            }
          })
      : Promise.resolve(),
  ]);

  function entityNameFor(item: BlogListRow): string | undefined {
    if (!item.linked_entity_id) return undefined;
    if (item.linked_entity_type === "club") return clubMap.get(item.linked_entity_id)?.name;
    if (item.linked_entity_type === "trainer")
      return trainerMap.get(item.linked_entity_id)?.name;
    if (item.linked_entity_type === "course")
      return courseMap.get(item.linked_entity_id)?.name;
    if (item.linked_entity_type === "expert")
      return expertMap.get(item.linked_entity_id)?.name;
    return undefined;
  }

  const emptyWriteHref = filters.club
    ? `/blog/new?club=${filters.club}`
    : filters.trainer
      ? `/blog/new?trainer=${filters.trainer}`
      : filters.course
        ? `/blog/new?course=${filters.course}`
        : filters.expert
          ? `/blog/new?expert=${filters.expert}`
          : null;
  const emptyWriteLabel = filters.club
    ? "Write club update"
    : filters.trainer
      ? "Share tip"
      : filters.course
        ? "Post about course"
        : filters.expert
          ? "Write health tip"
          : null;
  const emptyEntityCopy = filters.club
    ? "No published updates from this club yet."
    : filters.trainer
      ? "No published tips from this trainer yet."
      : filters.course
        ? "No published notes from this course yet."
        : filters.expert
          ? "No published health tips from this expert yet."
          : entityTypeFilter === "expert"
            ? "No expert health tips published yet."
            : "Try clearing filters or broadening your search.";

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
          trainer: filters.trainer,
          course: filters.course,
          expert: filters.expert,
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
            options: [
              { value: "club", label: "Club updates" },
              { value: "trainer", label: "Trainer tips" },
              { value: "course", label: "Course updates" },
              { value: "expert", label: "Expert health tips" },
            ],
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
              ? emptyEntityCopy
              : "Share your expertise and stories with a community that values the finest in equestrian culture."
          }
          action={
            active ? (
              emptyWriteHref && emptyWriteLabel ? (
                <Link href={emptyWriteHref} className="btn btn-primary">
                  {emptyWriteLabel}
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
            const entityName = entityNameFor(item);
            const badge = linkedEntityBadgeLabel(item.linked_entity_type);
            return (
              <ListingCard
                key={item.id}
                href={`/blog/${item.id}`}
                title={item.title}
                subtitle={
                  entityName
                    ? `${categoryLabel ?? linkedEntityFilterLabel(item.linked_entity_type)} · ${entityName}`
                    : categoryLabel
                }
                image={resolveBlogCover(item.title, item.cover_image)}
                badges={
                  <>
                    {item.is_featured ? <FeaturedBadge /> : null}
                    {badge ? <span className="badge">{badge}</span> : null}
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
