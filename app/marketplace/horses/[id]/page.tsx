import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCurrentProfile } from "@/lib/auth";
import {
  HORSE_DISCIPLINES,
  HORSE_GENDERS,
  HORSE_PURPOSES,
  LISTING_TYPES,
} from "@/lib/constants";

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
) {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("horses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Horse Listing" };
}

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: horse } = await supabase.from("horses").select("*").eq("id", id).single();
  if (!horse) notFound();
  const [{ data: owner }, profile] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("id", horse.owner_id).single(),
    getCurrentProfile(),
  ]);

  const canEdit =
    profile &&
    (profile.id === horse.owner_id || ["admin", "moderator"].includes(profile.role));

  const facts: { label: string; value: string }[] = [
    { label: "Breed", value: horse.breed ?? "—" },
    { label: "Age", value: horse.age != null ? String(horse.age) : "—" },
    { label: "Gender", value: labelOf(HORSE_GENDERS, horse.gender) ?? horse.gender ?? "—" },
    {
      label: "Listing type",
      value: labelOf(LISTING_TYPES, horse.listing_type) ?? horse.listing_type ?? "—",
    },
    {
      label: "Discipline",
      value: labelOf(HORSE_DISCIPLINES, horse.discipline) ?? horse.discipline ?? "—",
    },
    {
      label: "Purpose",
      value: labelOf(HORSE_PURPOSES, horse.purpose) ?? horse.purpose ?? "—",
    },
    {
      label: "Height",
      value: horse.height_cm != null ? `${horse.height_cm} cm` : "—",
    },
    { label: "Color", value: horse.color ?? "—" },
    {
      label: "Price",
      value: horse.price ? `${horse.currency ?? "USD"} ${horse.price}` : "On request",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {horse.is_featured && <FeaturedBadge />}
            <h1 className="text-3xl font-bold">{horse.title}</h1>
            <p className="text-[var(--color-muted)]">
              {[horse.city, getCountryName(horse.country_code)].filter(Boolean).join(", ")}
            </p>
          </div>
          {canEdit ? (
            <Link href={`/marketplace/horses/${horse.id}/edit`} className="btn btn-secondary">
              Edit listing
            </Link>
          ) : null}
        </div>
        <ListingGallery photos={horse.photos} videoUrl={horse.video_url} alt={horse.title} />
        <p>{horse.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="font-semibold">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="space-y-4">
        <FavoriteButton entityType="horse" entityId={horse.id} />
        {owner && <InquiryForm recipientId={owner.id} entityType="horse" entityId={horse.id} />}
      </div>
    </div>
  );
}
