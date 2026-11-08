import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { VerifiedBadge, ListingCard, EmptyState } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_profiles")
    .select("business_name")
    .eq("id", id)
    .single();
  return { title: data?.business_name ?? "Seller" };
}

export default async function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: seller } = await supabase.from("seller_profiles").select("*").eq("id", id).single();
  if (!seller) notFound();

  const isOwner = Boolean(profile && profile.id === seller.user_id);
  const [{ data: products }, activityResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, price, currency")
      .eq("seller_id", id)
      .eq("status", "published")
      .limit(12),
    supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, published_at, excerpt")
      .eq("status", "published")
      .eq("linked_entity_type", "seller")
      .eq("linked_entity_id", id)
      .order("published_at", { ascending: false })
      .limit(6),
  ]);
  const activityPosts = isMissingLinkedEntityColumn(activityResult.error)
    ? []
    : activityResult.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {seller.is_verified ? <VerifiedBadge /> : null}
          <h1 className="text-3xl font-bold">{seller.business_name}</h1>
          <p className="text-[var(--color-muted)]">
            {[seller.city, getCountryName(seller.country_code)].filter(Boolean).join(", ")}
          </p>
        </div>
        {isOwner ? (
          <Link href={`/blog/new?seller=${seller.id}`} className="btn btn-primary">
            Listing story
          </Link>
        ) : null}
      </div>
      {seller.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={seller.logo_url}
          alt={seller.business_name}
          className="h-32 w-32 rounded-lg object-cover"
        />
      ) : null}
      {seller.description ? <p>{seller.description}</p> : null}

      <section>
        <h2 className="text-xl font-semibold">Products</h2>
        {!products?.length ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No products listed yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {products.map((p) => (
              <li key={p.id}>
                <a href={`/marketplace/products/${p.id}`}>{p.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-serif text-2xl font-bold">From this seller</h2>
          <Link
            href={`/blog?seller=${seller.id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            View all stories
          </Link>
        </div>
        {!activityPosts?.length ? (
          <EmptyState
            title={isOwner ? "No listing stories yet" : "No seller stories yet"}
            description={
              isOwner
                ? "You’re the seller — tell buyers about new arrivals, care guides, or your shop."
                : "Ask this seller to share news and stories in the Journal."
            }
            action={
              isOwner ? (
                <Link href={`/blog/new?seller=${seller.id}`} className="btn btn-primary">
                  Listing story
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="listing-grid">
            {activityPosts.map((post) => (
              <ListingCard
                key={post.id}
                href={`/blog/${post.id}`}
                title={post.title}
                subtitle={
                  post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : undefined
                }
                image={resolveBlogCover(post.title, post.cover_image)}
                badges={<span className="badge">Seller story</span>}
              />
            ))}
          </div>
        )}
      </section>

      <ReviewsSection entityType="seller" entityId={id} />
    </div>
  );
}
