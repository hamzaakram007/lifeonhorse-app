import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ListingCard } from "@/components/ui";
import { BlogCover } from "@/components/ui/BlogCover";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveBlogCover } from "@/lib/blog-covers";
import {
  isBlogComposerEntityType,
  linkedEntityBadgeLabel,
  linkedEntityFilterLabel,
  linkedEntityHref,
} from "@/lib/blog/linked-entity";

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

  const linkedType = isBlogComposerEntityType(post.linked_entity_type)
    ? post.linked_entity_type
    : null;
  const linkedId = linkedType && post.linked_entity_id ? (post.linked_entity_id as string) : null;

  let linkedEntity: { id: string; name: string; href: string } | null = null;
  if (linkedType && linkedId) {
    const href = linkedEntityHref(linkedType, linkedId);
    if (linkedType === "club") {
      const { data } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("id", linkedId)
        .maybeSingle();
      if (data && href) linkedEntity = { id: data.id, name: data.name, href };
    } else if (linkedType === "trainer") {
      const { data } = await supabase
        .from("trainers")
        .select("id, display_name")
        .eq("id", linkedId)
        .maybeSingle();
      if (data && href)
        linkedEntity = { id: data.id, name: data.display_name, href };
    } else if (linkedType === "course") {
      const { data } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", linkedId)
        .maybeSingle();
      if (data && href) linkedEntity = { id: data.id, name: data.title, href };
    }
  }

  let relatedQuery = supabase
    .from("blog_posts")
    .select("id, title, category, cover_image, linked_entity_type, linked_entity_id")
    .eq("status", "published")
    .neq("id", id)
    .limit(3);

  if (linkedType && linkedId) {
    relatedQuery = relatedQuery
      .eq("linked_entity_type", linkedType)
      .eq("linked_entity_id", linkedId);
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
  const badge = linkedEntityBadgeLabel(linkedType);

  let canEdit = Boolean(
    profile &&
      (post.author_id === profile.id || ["admin", "moderator"].includes(profile.role))
  );
  if (!canEdit && profile && linkedType && linkedId) {
    if (linkedType === "club") {
      const { data: owned } = await supabase
        .from("clubs")
        .select("id")
        .eq("id", linkedId)
        .eq("owner_id", profile.id)
        .maybeSingle();
      canEdit = Boolean(owned);
    } else if (linkedType === "trainer") {
      const { data: owned } = await supabase
        .from("trainers")
        .select("id")
        .eq("id", linkedId)
        .eq("user_id", profile.id)
        .maybeSingle();
      canEdit = Boolean(owned);
    } else if (linkedType === "course") {
      const { data: owned } = await supabase
        .from("courses")
        .select("id")
        .eq("id", linkedId)
        .eq("creator_id", profile.id)
        .maybeSingle();
      canEdit = Boolean(owned);
    }
  }

  const crumbLabel = linkedType ? linkedEntityFilterLabel(linkedType) : null;
  const crumbHref = linkedType ? `/blog?entity_type=${linkedType}` : null;

  return (
    <article className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          ...(crumbLabel && crumbHref
            ? [{ label: crumbLabel, href: crumbHref }]
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
          {linkedEntity ? (
            <Link href={linkedEntity.href} className="badge hover:opacity-90">
              From {linkedEntity.name}
            </Link>
          ) : badge ? (
            <span className="badge">{badge}</span>
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
          {linkedEntity ? (
            <Link
              href={linkedEntity.href}
              className="text-[var(--color-primary)] hover:underline"
            >
              {linkedEntity.name}
            </Link>
          ) : null}
        </div>
        {post.status === "draft" ? (
          <p className="text-sm text-amber-700">
            Draft — only visible to you, linked entity owners, and admins.
          </p>
        ) : null}
      </header>
      <div className="prose-legal max-w-none whitespace-pre-wrap text-base leading-relaxed">
        {post.content}
      </div>
      {related && related.length > 0 ? (
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-serif text-2xl font-bold">Related articles</h2>
          <div className="listing-grid mt-6">
            {related.map((r) => {
              const relatedBadge = linkedEntityBadgeLabel(r.linked_entity_type);
              return (
                <ListingCard
                  key={r.id}
                  href={`/blog/${r.id}`}
                  title={r.title}
                  subtitle={labelFromOptions(BLOG_CATEGORIES, r.category) || undefined}
                  image={resolveBlogCover(r.title, r.cover_image)}
                  badges={
                    relatedBadge ? <span className="badge">{relatedBadge}</span> : null
                  }
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </article>
  );
}
