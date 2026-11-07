import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, FeaturedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCountryName } from "@/lib/countries";
import { EVENT_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { parsePhotoList } from "@/lib/storage/upload";

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

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const [{ data: club }, { data: host }] = await Promise.all([
    event.club_id
      ? supabase.from("clubs").select("id, name").eq("id", event.club_id).single()
      : Promise.resolve({ data: null }),
    event.host_id
      ? supabase.from("profiles").select("id, full_name").eq("id", event.host_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const typeLabel = labelFromOptions(EVENT_TYPES, event.event_type);
  const location = [event.venue, event.city, getCountryName(event.country_code)]
    .filter(Boolean)
    .join(", ");
  const photos = parsePhotoList(event.photos);
  const start = formatDateTime(event.start_date);
  const end = formatDateTime(event.end_date);

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
      <div className="flex flex-wrap gap-2">
        {event.is_featured ? <FeaturedBadge /> : null}
        {typeLabel ? <span className="badge">{typeLabel}</span> : null}
      </div>
      <h1 className="font-serif text-3xl font-bold">{event.title}</h1>
      {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
      {start ? (
        <p className="text-sm text-[var(--color-muted)]">
          {start}
          {end ? ` – ${end}` : ""}
        </p>
      ) : null}
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
    </div>
  );
}
