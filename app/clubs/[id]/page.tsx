import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ListingGallery, ListingCard, VerifiedBadge, FeaturedBadge, EmptyState } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewsSection } from "@/components/ReviewsSection";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCountryName } from "@/lib/countries";
import { CLUB_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveClubPhotos } from "@/lib/club-covers";
import { resolveBlogCover } from "@/lib/blog-covers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clubs").select("name").eq("id", id).single();
  return { title: data?.name ?? "Club" };
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: club } = await supabase.from("clubs").select("*").eq("id", id).single();
  if (!club) notFound();

  const typeLabel = labelFromOptions(CLUB_TYPES, club.club_type);
  const location = [club.city, getCountryName(club.country_code)].filter(Boolean).join(", ");
  const photos = resolveClubPhotos(club.id, club.name, club.photos, club.logo_url);
  const { data: owner } = await supabase.from("profiles").select("id").eq("id", club.owner_id).single();
  const isOwner = Boolean(profile && profile.id === club.owner_id);

  const [{ data: activityPosts }, { data: upcomingEvents }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, published_at, excerpt")
      .eq("status", "published")
      .eq("linked_entity_type", "club")
      .eq("linked_entity_id", id)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("events")
      .select("id, title, start_date, city")
      .eq("club_id", id)
      .eq("status", "published")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(4),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {club.is_verified ? <VerifiedBadge /> : null}
            {club.is_featured ? <FeaturedBadge /> : null}
            {typeLabel ? <span className="badge">{typeLabel}</span> : null}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-bold">{club.name}</h1>
              {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
            </div>
            {isOwner ? (
              <Link href={`/blog/new?club=${club.id}`} className="btn btn-primary">
                Write club update
              </Link>
            ) : null}
          </div>
          <ListingGallery photos={photos} alt={club.name} />
          {club.description ? <p className="leading-relaxed">{club.description}</p> : null}
          {(club.phone || club.email || club.website) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {club.phone ? (
                <a href={`tel:${club.phone}`} className="btn btn-secondary">
                  Call
                </a>
              ) : null}
              {club.email ? (
                <a href={`mailto:${club.email}`} className="btn btn-secondary">
                  Email
                </a>
              ) : null}
              {club.website ? (
                <a href={club.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Website
                </a>
              ) : null}
            </div>
          )}

          <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-serif text-2xl font-bold">From this club</h2>
              <Link
                href={`/blog?club=${club.id}`}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                View all updates
              </Link>
            </div>
            {!activityPosts?.length ? (
              <EmptyState
                title={isOwner ? "No updates yet" : "No club updates yet"}
                description={
                  isOwner
                    ? "You’re the owner — publish the first update for members and visitors."
                    : "Ask this club to share news, results, and upcoming plans."
                }
                action={
                  isOwner ? (
                    <Link href={`/blog/new?club=${club.id}`} className="btn btn-primary">
                      Write club update
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
                    badges={<span className="badge">Club update</span>}
                  />
                ))}
              </div>
            )}
          </section>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <section className="space-y-3 border-t border-[var(--color-border)] pt-6">
              <h2 className="font-serif text-2xl font-bold">Upcoming events</h2>
              <ul className="space-y-2">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {event.title}
                    </Link>
                    <span className="text-sm text-[var(--color-muted)]">
                      {" "}
                      ·{" "}
                      {[
                        event.start_date
                          ? new Date(event.start_date).toLocaleDateString()
                          : null,
                        event.city,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <ReviewsSection entityType="club" entityId={id} />
        </div>
        <div className="space-y-4">
          <FavoriteButton entityType="club" entityId={club.id} />
          {owner && <InquiryForm recipientId={owner.id} entityType="club" entityId={club.id} />}
        </div>
      </div>
    </div>
  );
}
