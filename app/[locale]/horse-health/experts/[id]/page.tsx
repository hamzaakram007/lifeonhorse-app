import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ListingGallery, ListingCard, VerifiedBadge, FeaturedBadge, EmptyState } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";
import { resolveExpertPhotos } from "@/lib/expert-covers";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("display_name").eq("id", id).single();
  return { title: data?.display_name ?? "Expert" };
}

export default async function ExpertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: expert } = await supabase.from("experts").select("*").eq("id", id).single();
  if (!expert) notFound();

  const isOwner = Boolean(profile && profile.id === expert.user_id);
  const location = [expert.city, getCountryName(expert.country_code)].filter(Boolean).join(", ");
  const photos = resolveExpertPhotos(
    expert.id,
    expert.display_name,
    expert.photos,
    expert.specialty,
  );

  const tipsResult = await supabase
    .from("blog_posts")
    .select("id, title, category, cover_image, published_at, excerpt")
    .eq("status", "published")
    .eq("linked_entity_type", "expert")
    .eq("linked_entity_id", id)
    .order("published_at", { ascending: false })
    .limit(6);
  const tipPosts = isMissingLinkedEntityColumn(tipsResult.error) ? [] : tipsResult.data;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Horse Health", href: "/horse-health" },
          { label: "Experts", href: "/horse-health/experts" },
          { label: expert.display_name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {expert.is_verified ? <VerifiedBadge /> : null}
            {expert.is_featured ? <FeaturedBadge /> : null}
            {expert.specialty ? <span className="badge">{expert.specialty}</span> : null}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-bold">{expert.display_name}</h1>
              {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
            </div>
            {isOwner ? (
              <Link
                href={`/blog/new?expert=${expert.id}&category=health`}
                className="btn btn-primary"
              >
                Write a tip
              </Link>
            ) : null}
          </div>

          <ListingGallery photos={photos} alt={expert.display_name} />

          {expert.description ? (
            <p className="leading-relaxed whitespace-pre-wrap">{expert.description}</p>
          ) : null}

          {expert.credentials ? (
            <div>
              <h2 className="font-semibold">Credentials</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)] whitespace-pre-wrap">
                {expert.credentials}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">
            <strong>Safety notice:</strong> Expert listings are for guidance and coordination only.
            LifeOnHorse is not for emergencies and does not replace a licensed veterinarian.{" "}
            <Link href="/legal/health-disclaimer" className="underline">
              Full disclaimer
            </Link>
          </div>

          <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold">Articles & tips</h2>
              <Link
                href={`/blog?expert=${expert.id}`}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                View all tips
              </Link>
            </div>
            {!tipPosts?.length ? (
              <EmptyState
                title={isOwner ? "No tips yet" : "No tips published yet"}
                description={
                  isOwner
                    ? "You’re the expert — publish the first health tip for horse owners."
                    : "Ask this expert to share educational guidance in the Journal."
                }
                action={
                  isOwner ? (
                    <Link
                      href={`/blog/new?expert=${expert.id}&category=health`}
                      className="btn btn-primary"
                    >
                      Write a tip
                    </Link>
                  ) : null
                }
              />
            ) : (
              <div className="listing-grid">
                {tipPosts.map((post) => (
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
                    badges={<span className="badge">Health tip</span>}
                  />
                ))}
              </div>
            )}
          </section>

          <ReviewsSection entityType="expert" entityId={id} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-serif text-lg font-semibold">Need guidance?</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Submit a health request and this expert can review your horse&apos;s case.
            </p>
            <Link
              href={`/horse-health/requests/new?expert_id=${expert.id}`}
              className="btn btn-primary mt-4 inline-flex w-full justify-center"
            >
              Submit health request
            </Link>
            <Link
              href="/horse-health/experts"
              className="btn btn-secondary mt-3 inline-flex w-full justify-center"
            >
              Browse more experts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
