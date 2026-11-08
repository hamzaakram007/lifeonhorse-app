import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ListingGallery, FeaturedBadge, ListingCard, EmptyState } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCountryName } from "@/lib/countries";
import { EVENT_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { parsePhotoList } from "@/lib/storage/upload";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";
import { loadOwnedEventForUser } from "@/lib/blog/event-ownership";

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("title").eq("id", id).single();
  return { title: data?.title ?? "Event" };
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const [{ data: club }, { data: host }, activityResult] = await Promise.all([
    event.club_id
      ? supabase.from("clubs").select("id, name, city, country_code").eq("id", event.club_id).single()
      : Promise.resolve({ data: null }),
    event.host_id
      ? supabase.from("profiles").select("id, full_name").eq("id", event.host_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, published_at, excerpt")
      .eq("status", "published")
      .eq("linked_entity_type", "event")
      .eq("linked_entity_id", id)
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  const activityPosts = isMissingLinkedEntityColumn(activityResult.error)
    ? []
    : activityResult.data;

  const isHost = Boolean(
    profile && (await loadOwnedEventForUser(supabase, profile.id, id))
  );
  const showCreateNudge = created === "1" && isHost;

  const typeLabel = labelFromOptions(EVENT_TYPES, event.event_type);
  const location = [event.venue, event.city, getCountryName(event.country_code)]
    .filter(Boolean)
    .join(", ");
  const photos = parsePhotoList(event.photos);
  const start = formatDateTime(event.start_date);
  const end = formatDateTime(event.end_date);
  const isPast =
    Boolean(event.end_date || event.start_date) &&
    new Date(event.end_date || event.start_date) < new Date();

  const facts: { label: string; value: ReactNode }[] = [
    { label: "Type", value: typeLabel || "—" },
    { label: "Starts", value: start ?? "—" },
    { label: "Ends", value: end ?? "—" },
    { label: "Venue", value: event.venue || "—" },
    {
      label: "Location",
      value: [event.city, getCountryName(event.country_code)].filter(Boolean).join(", ") || "—",
    },
    {
      label: "Host club",
      value: club ? (
        <Link href={`/clubs/${club.id}`} className="text-[var(--color-accent)] underline-offset-2 hover:underline">
          {club.name}
        </Link>
      ) : (
        "—"
      ),
    },
    {
      label: "Hosted by",
      value: host?.full_name || "—",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: event.title }]} />

      {showCreateNudge ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <p className="font-medium">Event published</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Share schedule notes, travel tips, or results so visitors keep coming back.
          </p>
          <Link href={`/blog/new?event=${id}`} className="btn btn-primary mt-3 inline-flex text-sm">
            Post an announcement
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {event.is_featured ? <FeaturedBadge /> : null}
        {typeLabel ? <span className="badge">{typeLabel}</span> : null}
        {isPast ? <span className="badge">Past event</span> : null}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{event.title}</h1>
          {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
          {start ? (
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {start}
              {end ? ` – ${end}` : ""}
            </p>
          ) : null}
        </div>
        {isHost ? (
          <Link href={`/blog/new?event=${id}`} className="btn btn-primary">
            Event update
          </Link>
        ) : null}
      </div>
      <ListingGallery photos={photos} alt={event.title} />
      {event.description ? <p className="leading-relaxed whitespace-pre-wrap">{event.description}</p> : null}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="font-semibold">{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {club ? (
        <section className="space-y-2 border-t border-[var(--color-border)] pt-6">
          <h2 className="font-serif text-2xl font-bold">Host club</h2>
          <p className="text-sm text-[var(--color-muted)]">
            This event is hosted with{" "}
            <Link
              href={`/clubs/${club.id}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {club.name}
            </Link>
            {[club.city, getCountryName(club.country_code)].filter(Boolean).length
              ? ` · ${[club.city, getCountryName(club.country_code)].filter(Boolean).join(", ")}`
              : ""}
            .
          </p>
          <Link href={`/clubs/${club.id}`} className="btn btn-secondary inline-flex text-sm">
            View club
          </Link>
        </section>
      ) : null}

      <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-serif text-2xl font-bold">
            {isPast ? "Updates archive" : "Updates"}
          </h2>
          <Link
            href={`/blog?event=${id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            View all updates
          </Link>
        </div>
        {!activityPosts?.length ? (
          <EmptyState
            title={isHost ? "No updates yet" : "No event updates yet"}
            description={
              isHost
                ? "You’re the host — post schedule changes, travel notes, or results."
                : "Check back for announcements from the host."
            }
            action={
              isHost ? (
                <Link href={`/blog/new?event=${id}`} className="btn btn-primary">
                  Write event update
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
                badges={<span className="badge">Event update</span>}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
