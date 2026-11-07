import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ListingCard } from "@/components/ui";
import { BlogCover } from "@/components/ui/BlogCover";
import { formatLocation } from "@/lib/location";
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
    .select("title, content, cover_image")
    .eq("id", id)
    .single();
  if (!post) return { title: "Article" };
  const description = post.content?.slice(0, 160) ?? "";
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
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, category, cover_image")
    .eq("status", "published")
    .neq("id", id)
    .limit(3);

  const minutes = readingTime(post.content ?? "");
  const published = post.published_at ?? post.created_at;
  const categoryLabel = labelFromOptions(BLOG_CATEGORIES, post.category) || undefined;
  const cover = resolveBlogCover(post.title, post.cover_image);

  return (
    <article className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-[var(--color-bg)]">
        <BlogCover src={cover} alt={post.title} priority />
      </div>
      <header className="mb-8 space-y-3">
        {categoryLabel && (
          <span className="badge badge-featured">{categoryLabel}</span>
        )}
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
          {published && (
            <time dateTime={published}>
              {new Date(published).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          <span>{minutes} min read</span>
          {formatLocation(post.city, post.country_code) && (
            <span>{formatLocation(post.city, post.country_code)}</span>
          )}
        </div>
      </header>
      <div className="prose-legal max-w-none whitespace-pre-wrap text-base leading-relaxed">
        {post.content}
      </div>
      {related && related.length > 0 && (
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
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
