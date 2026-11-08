import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryByCode } from "@/lib/countries";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { CLUB_TYPES } from "@/lib/constants";
import { labelFromOptions, humanizeSlug } from "@/lib/labels";
import { DUPLICATE_CLUB_IDS, resolveClubCover } from "@/lib/club-covers";
import { firstPhoto } from "@/lib/storage/upload";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const country = getCountryByCode(code);
  return { title: country ? `Horses in ${country.name}` : "Country" };
}

function SectionEmpty({
  title,
  description,
  browseHref,
  browseLabel,
  createHref,
  createLabel,
}: {
  title: string;
  description: string;
  browseHref: string;
  browseLabel: string;
  createHref: string;
  createLabel: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={browseHref} className="btn btn-primary">
            {browseLabel}
          </Link>
          <Link href={createHref} className="btn btn-secondary">
            {createLabel}
          </Link>
        </div>
      }
    />
  );
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = getCountryByCode(code);
  if (!country) notFound();
  const supabase = await createClient();
  const cc = country.code;
  const [{ data: horses }, { data: clubs }, { data: trainers }, { data: activityClubs }] =
    await Promise.all([
      supabase
        .from("horses")
        .select("id, title, photos, price, currency, city")
        .eq("country_code", cc)
        .eq("status", "published")
        .limit(8),
      supabase
        .from("clubs")
        .select("id, name, club_type, logo_url, photos")
        .eq("country_code", cc)
        .eq("status", "published")
        .limit(16),
      supabase
        .from("trainers")
        .select("id, display_name, specialty, photos")
        .eq("country_code", cc)
        .eq("status", "published")
        .limit(8),
      supabase
        .from("clubs")
        .select("id, name")
        .eq("country_code", cc)
        .eq("status", "published")
        .limit(200),
    ]);

  const countryClubs = (clubs ?? []).filter((c) => !DUPLICATE_CLUB_IDS.has(c.id)).slice(0, 8);
  const countryHorses = horses ?? [];
  const countryTrainers = trainers ?? [];

  const clubIdsForActivity = (activityClubs ?? []).map((c) => c.id);
  const clubNameById = new Map((activityClubs ?? []).map((c) => [c.id, c.name]));
  let recentClubActivity: {
    id: string;
    title: string;
    cover_image: string | null;
    published_at: string | null;
    linked_entity_id: string | null;
  }[] = [];

  if (clubIdsForActivity.length) {
    const activityResult = await supabase
      .from("blog_posts")
      .select("id, title, cover_image, published_at, linked_entity_id")
      .eq("status", "published")
      .eq("linked_entity_type", "club")
      .in("linked_entity_id", clubIdsForActivity)
      .order("published_at", { ascending: false })
      .limit(6);
    recentClubActivity = isMissingLinkedEntityColumn(activityResult.error)
      ? []
      : ((activityResult.data ?? []) as typeof recentClubActivity);
  }

  return (
    <div className="space-y-8">
      <SectionHero
        title={country.name}
        subtitle={`Horse marketplace, clubs, and trainers in ${country.name}`}
        image={SECTION_IMAGES.countries}
      />
      <section className="space-y-4">
        <div className="mb-1 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent club activity</h2>
          <Link
            href={`/blog?entity_type=club`}
            className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
          >
            Journal club updates
          </Link>
        </div>
        {!recentClubActivity.length ? (
          <EmptyState
            title={`No club updates in ${country.name} yet`}
            description={`When clubs in ${country.name} publish Journal updates, they appear here.`}
            action={
              <Link href={`/clubs?country=${cc}`} className="btn btn-secondary">
                Browse clubs in {country.name}
              </Link>
            }
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentClubActivity.map((post) => {
              const clubName = post.linked_entity_id
                ? clubNameById.get(post.linked_entity_id)
                : undefined;
              return (
                <ListingCard
                  key={post.id}
                  href={`/blog/${post.id}`}
                  title={post.title}
                  subtitle={
                    [
                      clubName,
                      post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  image={resolveBlogCover(post.title, post.cover_image)}
                  badges={<span className="badge">Club update</span>}
                />
              );
            })}
          </div>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Horses</h2>
          {countryHorses.length > 0 ? (
            <Link
              href={`/marketplace/horses?country=${cc}`}
              className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
            >
              View all in {country.name}
            </Link>
          ) : null}
        </div>
        {countryHorses.length === 0 ? (
          <SectionEmpty
            title={`No horses listed in ${country.name} yet`}
            description={`Browse the marketplace filtered to ${country.name}, or list the first horse from this country.`}
            browseHref={`/marketplace/horses?country=${cc}`}
            browseLabel={`Browse horses in ${country.name}`}
            createHref="/marketplace/horses/new"
            createLabel="List a horse"
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {countryHorses.map((h) => (
              <ListingCard
                key={h.id}
                href={`/marketplace/horses/${h.id}`}
                title={h.title}
                image={firstPhoto(h.photos)}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Clubs</h2>
          {countryClubs.length > 0 ? (
            <Link
              href={`/clubs?country=${cc}`}
              className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
            >
              View all in {country.name}
            </Link>
          ) : null}
        </div>
        {countryClubs.length === 0 ? (
          <SectionEmpty
            title={`No clubs in ${country.name} yet`}
            description={`Open clubs filtered to ${country.name}, or register the first club here.`}
            browseHref={`/clubs?country=${cc}`}
            browseLabel={`Browse clubs in ${country.name}`}
            createHref="/clubs/register"
            createLabel="Register a club"
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {countryClubs.map((c) => (
              <ListingCard
                key={c.id}
                href={`/clubs/${c.id}`}
                title={c.name}
                subtitle={labelFromOptions(CLUB_TYPES, c.club_type) || undefined}
                image={resolveClubCover(c.id, c.name, c.photos, c.logo_url)}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Trainers</h2>
          {countryTrainers.length > 0 ? (
            <Link
              href={`/trainers?country=${cc}`}
              className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
            >
              View all in {country.name}
            </Link>
          ) : null}
        </div>
        {countryTrainers.length === 0 ? (
          <SectionEmpty
            title={`No trainers in ${country.name} yet`}
            description={`Browse trainers filtered to ${country.name}, or join as the first trainer here.`}
            browseHref={`/trainers?country=${cc}`}
            browseLabel={`Browse trainers in ${country.name}`}
            createHref="/trainers/new"
            createLabel="Join as trainer"
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {countryTrainers.map((t) => (
              <ListingCard
                key={t.id}
                href={`/trainers/${t.id}`}
                title={t.display_name}
                subtitle={humanizeSlug(t.specialty) || undefined}
                image={firstPhoto(t.photos)}
              />
            ))}
          </div>
        )}
      </section>
      <Link href="/payments" className="text-sm">
        Payment guidance for {country.name} →
      </Link>
    </div>
  );
}
