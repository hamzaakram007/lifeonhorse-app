import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { EVENT_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { escapeIlike } from "@/lib/filters/escape-ilike";
import {
  hasActiveEventFilters,
  normalizeEventSearchParams,
  type EventSearchParams,
} from "@/lib/events/event-filters";

export const metadata: Metadata = {
  title: "Events",
  description: "Championships, clinics, auctions, and equestrian gatherings worldwide",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<EventSearchParams>;
}) {
  const filters = normalizeEventSearchParams(await searchParams);
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("events")
    .select(
      "id, title, event_type, country_code, city, venue, start_date, end_date, photos, is_featured"
    )
    .eq("status", "published")
    .gte("start_date", nowIso)
    .order("start_date", { ascending: true })
    .limit(24);

  if (filters.country) query = query.eq("country_code", filters.country);
  if (filters.event_type) query = query.eq("event_type", filters.event_type);
  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.q) {
    const q = escapeIlike(filters.q.replace(/,/g, " "));
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,venue.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const active = hasActiveEventFilters(filters);
  const heroT = await getTranslations("Heroes.events");
  const commonT = await getTranslations("Common");
  const formsT = await getTranslations("Forms");
  const emptyT = await getTranslations("Empty");

  return (
    <div className="space-y-8">
      <SectionHero
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        image={SECTION_IMAGES.events}
        action={{ href: "/events/new", label: `+ ${commonT("listEvent")}` }}
      />

      <FilterBar
        action="/events"
        clearHref="/events"
        values={{
          country: filters.country,
          event_type: filters.event_type,
          featured: filters.featured,
          q: filters.q,
        }}
        fields={[
          { kind: "country", name: "country" },
          {
            kind: "select",
            name: "event_type",
            options: EVENT_TYPES,
            allLabel: formsT("allEventTypes"),
          },
          {
            kind: "select",
            name: "featured",
            options: [{ value: "1", label: formsT("featuredOnly") }],
            allLabel: formsT("allEvents"),
          },
          { kind: "text", name: "q", placeholder: formsT("searchEvents") },
        ]}
      />

      {!data?.length ? (
        <EmptyState
          title={active ? emptyT("noEventsMatch") : emptyT("noEvents")}
          description={active ? emptyT("tryBroadenSearch") : emptyT("eventsDesc")}
          action={
            active ? (
              <Link href="/events" className="btn btn-secondary">
                {commonT("clearFilters")}
              </Link>
            ) : (
              <Link href="/events/new" className="btn btn-primary">
                {commonT("listEvent")}
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photos = parsePhotoList(item.photos);
            const typeLabel = labelFromOptions(EVENT_TYPES, item.event_type);
            const when = item.start_date
              ? new Date(item.start_date).toLocaleDateString()
              : null;
            return (
              <ListingCard
                key={item.id}
                href={`/events/${item.id}`}
                title={item.title}
                subtitle={typeLabel || undefined}
                image={firstPhoto(item.photos)}
                photoCount={photos.length || undefined}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={[when, item.venue, formatLocation(item.city, item.country_code)]
                  .filter(Boolean)
                  .join(" · ")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
