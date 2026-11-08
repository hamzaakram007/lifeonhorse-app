import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { FilterBar } from "@/components/filters/FilterBar";
import { formatLocation } from "@/lib/location";
import { SECTION_IMAGES } from "@/lib/section-images";
import { CLUB_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { DUPLICATE_CLUB_IDS, resolveClubCover, resolveClubPhotos } from "@/lib/club-covers";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Elite polo clubs, riding schools, and equestrian communities worldwide",
};

type ClubSearchParams = {
  country?: string;
  q?: string;
};

function normalizeClubParams(
  raw: Record<string, string | string[] | undefined>
): ClubSearchParams {
  const pick = (key: keyof ClubSearchParams) => {
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
  const filters = normalizeClubParams(await searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("clubs")
    .select("id, name, club_type, country_code, city, logo_url, photos, is_verified, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(48);

  if (filters.country) query = query.eq("country_code", filters.country);
  if (filters.q) {
    const q = filters.q.replace(/,/g, " ").replace(/[%_\\]/g, "");
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data } = await query;
  const clubs = (data ?? []).filter((item) => !DUPLICATE_CLUB_IDS.has(item.id));
  const active = Boolean(filters.country || filters.q);
  const countryLabel = filters.country ? getCountryName(filters.country) : null;
  const heroT = await getTranslations("Heroes.clubs");
  const commonT = await getTranslations("Common");
  const formsT = await getTranslations("Forms");
  const emptyT = await getTranslations("Empty");

  return (
    <div className="space-y-8">
      <SectionHero
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        image={SECTION_IMAGES.clubs}
        action={{ href: "/clubs/register", label: `+ ${commonT("registerClub")}` }}
      />

      <FilterBar
        action="/clubs"
        clearHref="/clubs"
        values={{ country: filters.country, q: filters.q }}
        fields={[
          { kind: "country", name: "country" },
          { kind: "text", name: "q", placeholder: formsT("searchClubs") },
        ]}
      />

      {!clubs.length ? (
        <EmptyState
          title={
            active
              ? countryLabel
                ? emptyT("noClubsInCountry", { country: countryLabel })
                : emptyT("noClubsMatch")
              : emptyT("noClubs")
          }
          description={active ? emptyT("tryClearFilters") : emptyT("noClubsDesc")}
          action={
            active ? (
              <Link href="/clubs" className="btn btn-secondary">
                {commonT("clearFilters")}
              </Link>
            ) : (
              <Link href="/clubs/register" className="btn btn-primary">
                {commonT("registerClub")}
              </Link>
            )
          }
        />
      ) : (
        <div className="listing-grid">
          {clubs.map((item) => {
            const photos = resolveClubPhotos(item.id, item.name, item.photos, item.logo_url);
            return (
              <ListingCard
                key={item.id}
                href={`/clubs/${item.id}`}
                title={item.name}
                subtitle={labelFromOptions(CLUB_TYPES, item.club_type) || undefined}
                image={resolveClubCover(item.id, item.name, item.photos, item.logo_url)}
                photoCount={photos.length > 1 ? photos.length : undefined}
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
