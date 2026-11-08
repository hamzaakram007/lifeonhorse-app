import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ListingCard } from "@/components/ui";
import { BlogCover } from "@/components/ui/BlogCover";
import { HealthDisclaimerBlock } from "@/components/blog/HealthDisclaimerBlock";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveBlogCover } from "@/lib/blog-covers";

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, content, cover_image, excerpt")
    .eq("id", id)
    .single();
  if (!post) return { title: "Article" };
  const description = post.excerpt || post.content?.slice(0, 160) || "";
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const isClubPost = post.linked_entity_type === "club" && Boolean(post.linked_entity_id);
  const isExpertPost = post.linked_entity_type === "expert" && Boolean(post.linked_entity_id);
  const showHealthDisclaimer = isExpertPost || post.category === "health";

  let club: { id: string; name: string } | null = null;
  let expert: { id: string; display_name: string } | null = null;
  if (isClubPost) {
    const { data } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("id", post.linked_entity_id)
      .maybeSingle();
    club = data;
  }
  if (isExpertPost) {
    const { data } = await supabase
      .from("experts")
      .select("id, display_name")
      .eq("id", post.linked_entity_id)
      .maybeSingle();
    expert = data;
  }

  let relatedQuery = supabase
    .from("blog_posts")
    .select("id, title, category, cover_image, linked_entity_type, linked_entity_id")
    .eq("status", "published")
    .neq("id", id)
    .limit(3);

  if (isExpertPost && post.linked_entity_id) {
    relatedQuery = relatedQuery
      .eq("linked_entity_type", "expert")
      .eq("linked_entity_id", post.linked_entity_id);
  } else if (isClubPost && post.linked_entity_id) {
    relatedQuery = relatedQuery
      .eq("linked_entity_type", "club")
      .eq("linked_entity_id", post.linked_entity_id);
  } else if (post.category) {
    relatedQuery = relatedQuery.eq("category", post.category);
  }

  let { data: related } = await relatedQuery;
  if ((!related || related.length === 0) && post.category) {
    const { data: byCategory } = await supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, linked_entity_type, linked_entity_id")
      .eq("status", "published")
      .eq("category", post.category)
      .neq("id", id)
      .limit(3);
    related = byCategory;
  }

  const minutes = readingTime(post.content ?? "");
  const published = post.published_at ?? post.created_at;
  const categoryLabel = labelFromOptions(BLOG_CATEGORIES, post.category) || undefined;
  const cover = resolveBlogCover(post.title, post.cover_image);

  let canEdit = Boolean(
    profile &&
      (post.author_id === profile.id || ["admin", "moderator"].includes(profile.role))
  );
  if (!canEdit && profile && isClubPost && post.linked_entity_id) {
    const { data: owned } = await supabase
      .from("clubs")
      .select("id")
      .eq("id", post.linked_entity_id)
      .eq("owner_id", profile.id)
      .maybeSingle();
    canEdit = Boolean(owned);
  }
  if (!canEdit && profile && isExpertPost && post.linked_entity_id) {
    const { data: owned } = await supabase
      .from("experts")
      .select("id")
      .eq("id", post.linked_entity_id)
      .eq("user_id", profile.id)
      .maybeSingle();
    canEdit = Boolean(owned);
  }

  return (
    <article className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          ...(isExpertPost
            ? [{ label: "Health tips", href: "/blog?entity_type=expert" }]
            : isClubPost
              ? [{ label: "Club updates", href: "/blog?entity_type=club" }]
              : []),
          { label: post.title },
        ]}
      />
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-[var(--color-bg)]">
        <BlogCover src={cover} alt={post.title} priority />
      </div>
      <header className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {categoryLabel ? <span className="badge badge-featured">{categoryLabel}</span> : null}
          {expert ? (
            <Link
              href={`/horse-health/experts/${expert.id}`}
              className="badge hover:opacity-90"
            >
              From {expert.display_name}
            </Link>
          ) : isExpertPost ? (
            <span className="badge">Health tip</span>
          ) : null}
          {club ? (
            <Link href={`/clubs/${club.id}`} className="badge hover:opacity-90">
              From {club.name}
            </Link>
          ) : isClubPost ? (
            <span className="badge">Club update</span>
          ) : null}
          {canEdit ? (
            <Link
              href={`/blog/${id}/edit`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Edit
            </Link>
          ) : null}
        </div>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
          {published ? (
            <time dateTime={published}>
              {new Date(published).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          ) : null}
          <span>{minutes} min read</span>
          {expert ? (
            <Link
              href={`/horse-health/experts/${expert.id}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              {expert.display_name}
            </Link>
          ) : null}
          {club ? (
            <Link href={`/clubs/${club.id}`} className="text-[var(--color-primary)] hover:underline">
              {club.name}
            </Link>
          ) : null}
        </div>
        {post.status === "draft" ? (
          <p className="text-sm text-amber-700">
            Draft — only visible to you and linked entity owners/admins.
          </p>
        ) : null}
      </header>
      <div className="prose-legal max-w-none whitespace-pre-wrap text-base leading-relaxed">
        {post.content}
      </div>
      {showHealthDisclaimer ? <HealthDisclaimerBlock /> : null}
      {related && related.length > 0 ? (
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-serif text-2xl font-bold">Related articles</h2>
          <div className="listing-grid mt-6">
            {related.map((r) => (
              <ListingCard
                key={r.id}
                href={`/blog/${r.id}`}
                title={r.title}
                subtitle={labelFromOptions(BLOG_CATEGORIES, r.category) || undefined}
                image={resolveBlogCover(r.title, r.cover_image)}
                badges={
                  r.linked_entity_type === "expert" ? (
                    <span className="badge">Health tip</span>
                  ) : r.linked_entity_type === "club" ? (
                    <span className="badge">Club update</span>
                  ) : null
                }
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
