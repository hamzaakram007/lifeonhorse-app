import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, guides, and horse culture",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("id, title, category, country_code, city, cover_image, is_verified, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-[var(--color-muted)]">Articles, guides, and horse culture</p>
        </div>
        <Link href="/blog/new" className="btn btn-primary">+ Create</Link>
      </div>
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one." action={<Link href="/blog/new" className="btn btn-primary">Create</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => (
            <ListingCard
              key={String(item.id)}
              href={`/blog/${item.id}`}
              title={String(item.title)}
              subtitle={String(item.category ?? '')}
              image={item.cover_image as string | null}
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
