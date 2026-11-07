import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { getCountryName } from "@/lib/countries";
import { parsePhotoList } from "@/lib/storage/upload";
import { SECTION_IMAGES } from "@/lib/section-images";
import {
  HORSE_DISCIPLINES,
  HORSE_GENDERS,
  LISTING_TYPES,
} from "@/lib/constants";
import {
  escapeIlike,
  hasActiveHorseFilters,
  normalizeHorseSearchParams,
  type HorseSearchParams,
} from "@/lib/marketplace/horse-filters";

export const metadata: Metadata = {
  title: "Horses for Sale",
  description: "Browse exceptional horse listings from verified breeders worldwide",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<HorseSearchParams>;
}) {
  const filters = normalizeHorseSearchParams(await searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("horses")
    .select(
      "id, title, price, currency, city, country_code, photos, is_featured, breed, listing_type, discipline, gender"
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  if (filters.country) query = query.eq("country_code", filters.country);
  if (filters.listing_type) query = query.eq("listing_type", filters.listing_type);
  if (filters.discipline) query = query.eq("discipline", filters.discipline);
  if (filters.gender) query = query.ilike("gender", filters.gender);
  if (filters.breed) query = query.ilike("breed", `%${escapeIlike(filters.breed)}%`);
  if (filters.min_price) {
    const min = Number(filters.min_price);
    if (!Number.isNaN(min)) query = query.gte("price", min);
  }
  if (filters.max_price) {
    const max = Number(filters.max_price);
    if (!Number.isNaN(max)) query = query.lte("price", max);
  }
  if (filters.q) {
    // Strip commas — PostgREST `or` uses them as separators.
    const q = escapeIlike(filters.q.replace(/,/g, " "));
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,breed.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const active = hasActiveHorseFilters(filters);

  return (
    <div className="space-y-8">
      <SectionHero
        title="Horses for Sale"
        subtitle="Exceptional bloodlines, champion pedigrees, and trusted breeders — discover your next partner in excellence."
        image={SECTION_IMAGES.marketplace}
        action={{ href: "/marketplace/horses/new", label: "+ List horse" }}
      />

      <FilterBar
        action="/marketplace/horses"
        clearHref="/marketplace/horses"
        values={{
          country: filters.country,
          breed: filters.breed,
          listing_type: filters.listing_type,
          discipline: filters.discipline,
          gender: filters.gender,
          min_price: filters.min_price,
          max_price: filters.max_price,
          q: filters.q,
        }}
        fields={[
          { kind: "country", name: "country" },
          {
            kind: "select",
            name: "listing_type",
            options: LISTING_TYPES,
            allLabel: "All listing types",
          },
          {
            kind: "select",
            name: "discipline",
            options: HORSE_DISCIPLINES,
            allLabel: "All disciplines",
          },
          {
            kind: "select",
            name: "gender",
            options: HORSE_GENDERS,
            allLabel: "All genders",
          },
          { kind: "text", name: "breed", placeholder: "Breed", className: "min-w-[8rem] flex-none" },
          { kind: "number", name: "min_price", placeholder: "Min price", min: 0, step: "1" },
          { kind: "number", name: "max_price", placeholder: "Max price", min: 0, step: "1" },
          { kind: "text", name: "q", placeholder: "Search horses…" },
        ]}
      />

      {!data?.length ? (
        <EmptyState
          title={active ? "No horses match these filters" : "No horses listed yet"}
          description={
            active
              ? "Try clearing filters or broadening your search."
              : "Be the first to showcase your horse to discerning buyers worldwide."
          }
          action={
            active ? (
              <Link href="/marketplace/horses" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : (
              <Link href="/marketplace/horses/new" className="btn btn-primary">
                List horse
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {data.map((item) => {
            const photoList = parsePhotoList(item.photos);
            const metaParts = [
              item.breed,
              item.listing_type,
              item.price ? `${item.currency ?? "USD"} ${item.price}` : "Price on request",
            ].filter(Boolean);
            return (
              <ListingCard
                key={item.id}
                href={`/marketplace/horses/${item.id}`}
                title={item.title}
                subtitle={[item.city, getCountryName(item.country_code)].filter(Boolean).join(", ")}
                image={photoList[0] ?? null}
                photoCount={photoList.length}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={metaParts.join(" · ")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
