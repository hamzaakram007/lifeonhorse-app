import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { humanizeSlug } from "@/lib/labels";
import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Trainers",
  description: "Elite riding coaches, vets, farriers, and equestrian experts",
};

type TrainerSearchParams = {
  country?: string;
  q?: string;
};

function normalizeTrainerParams(
  raw: Record<string, string | string[] | undefined>
): TrainerSearchParams {
  const pick = (key: keyof TrainerSearchParams) => {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };
  return { country: pick("country"), q: pick("q") };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = normalizeTrainerParams(await searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("trainers")
    .select("id, display_name, specialty, country_code, city, photos, is_verified, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  if (filters.country) query = query.eq("country_code", filters.country);
  if (filters.q) {
    const q = filters.q.replace(/,/g, " ").replace(/[%_\\]/g, "");
    query = query.or(
      `display_name.ilike.%${q}%,specialty.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const active = Boolean(filters.country || filters.q);
  const countryLabel = filters.country ? getCountryName(filters.country) : null;

  return (
    <div className="space-y-8">
      <SectionHero
        title="Expert Trainers"
        subtitle="Connect with Olympic-caliber coaches, master farriers, and renowned equine specialists trusted by champions."
        image={SECTION_IMAGES.trainers}
        action={{ href: "/trainers/new", label: "+ Join as trainer" }}
      />

      <FilterBar
        action="/trainers"
        clearHref="/trainers"
        values={{ country: filters.country, q: filters.q }}
        fields={[
          { kind: "country", name: "country" },
          { kind: "text", name: "q", placeholder: "Search trainers…" },
        ]}
      />

      {!data?.length ? (
        <EmptyState
          title={
            active
              ? countryLabel
                ? `No trainers in ${countryLabel}`
                : "No trainers match these filters"
              : "No trainers listed yet"
          }
          description={
            active
              ? "Try clearing filters or browse another country."
              : "Showcase your expertise to a discerning global audience of riders and stable owners."
          }
          action={
            active ? (
              <Link href="/trainers" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : (
              <Link href="/trainers/new" className="btn btn-primary">
                Join as trainer
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photos = parsePhotoList(item.photos);
            return (
              <ListingCard
                key={item.id}
                href={`/trainers/${item.id}`}
                title={item.display_name}
                subtitle={humanizeSlug(item.specialty) || undefined}
                image={firstPhoto(item.photos)}
                photoCount={photos.length || undefined}
                badges={
                  <>
                    {item.is_verified ? <VerifiedBadge /> : null}
                    {item.is_featured ? <FeaturedBadge /> : null}
                  </>
                }
                meta={formatLocation(item.city, item.country_code)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
