import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { EXPERT_CATEGORIES } from "@/lib/constants";
import { resolveExpertCover, resolveExpertPhotos } from "@/lib/expert-covers";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Find an Expert",
  description: "Browse verified equine veterinarians, farriers, nutritionists, and specialists",
};

type ExpertSearchParams = {
  country?: string;
  specialty?: string;
  q?: string;
};

/** Map filter values to DB specialty ILIKE patterns (live rows use free-text specialties). */
const SPECIALTY_PATTERNS: Record<string, string> = {
  vet: "%vet%",
  farrier: "%farrier%",
  nutrition: "%nutrition%",
  behavior: "%behavior%",
  breeding: "%breed%",
  other: "%",
};

function normalizeExpertParams(
  raw: Record<string, string | string[] | undefined>,
): ExpertSearchParams {
  const pick = (key: keyof ExpertSearchParams) => {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };
  return {
    country: pick("country"),
    specialty: pick("specialty"),
    q: pick("q"),
  };
}

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = normalizeExpertParams(await searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("experts")
    .select("id, display_name, specialty, city, country_code, photos, is_verified, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(48);

  if (filters.country) query = query.eq("country_code", filters.country);
  if (filters.specialty && filters.specialty !== "other") {
    if (filters.specialty === "breeding") {
      query = query.or("specialty.ilike.%breed%,specialty.ilike.%reproduct%");
    } else {
      const pattern = SPECIALTY_PATTERNS[filters.specialty] ?? `%${filters.specialty}%`;
      query = query.ilike("specialty", pattern);
    }
  }
  if (filters.q) {
    const q = filters.q.replace(/,/g, " ").replace(/[%_\\]/g, "");
    query = query.or(
      `display_name.ilike.%${q}%,specialty.ilike.%${q}%,city.ilike.%${q}%`,
    );
  }

  const { data } = await query;
  const experts = data ?? [];
  const active = Boolean(filters.country || filters.specialty || filters.q);
  const countryLabel = filters.country ? getCountryName(filters.country) : null;

  return (
    <div className="space-y-8">
      <SectionHero
        title="Find an Expert"
        subtitle="Verified equine veterinarians, farriers, nutritionists, and specialists ready to guide horse health decisions."
        image={SECTION_IMAGES.health}
        action={{ href: "/horse-health/experts/apply", label: "+ Apply as expert" }}
      >
        <Link
          href="/horse-health"
          className="mt-4 inline-flex text-sm font-medium text-white/85 underline-offset-4 hover:underline"
        >
          ← Horse Health
        </Link>
      </SectionHero>

      <FilterBar
        action="/horse-health/experts"
        clearHref="/horse-health/experts"
        values={{
          country: filters.country,
          specialty: filters.specialty,
          q: filters.q,
        }}
        fields={[
          { kind: "country", name: "country" },
          {
            kind: "select",
            name: "specialty",
            allLabel: "All specialties",
            options: EXPERT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          },
          { kind: "text", name: "q", placeholder: "Search experts…" },
        ]}
      />

      {!experts.length ? (
        <EmptyState
          title={
            active
              ? countryLabel
                ? `No experts in ${countryLabel}`
                : "No experts match these filters"
              : "No experts listed yet"
          }
          description={
            active
              ? "Try clearing filters or browse another specialty."
              : "Apply to join the directory and help horse owners worldwide."
          }
          action={
            active ? (
              <Link href="/horse-health/experts" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : (
              <Link href="/horse-health/experts/apply" className="btn btn-primary">
                Apply as expert
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {experts.map((item) => {
            const photos = resolveExpertPhotos(
              item.id,
              item.display_name,
              item.photos,
              item.specialty,
            );
            return (
              <ListingCard
                key={item.id}
                href={`/horse-health/experts/${item.id}`}
                title={item.display_name}
                subtitle={item.specialty || undefined}
                image={resolveExpertCover(
                  item.id,
                  item.display_name,
                  item.photos,
                  item.specialty,
                )}
                photoCount={photos.length || undefined}
                badges={
                  <>
                    {item.is_verified ? <VerifiedBadge /> : null}
                    {item.is_featured ? <FeaturedBadge /> : null}
                  </>
                }
                meta={formatLocation(item.city, item.country_code) || undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
