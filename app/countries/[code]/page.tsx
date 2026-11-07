import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryByCode } from "@/lib/countries";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const country = getCountryByCode(code);
  return { title: country ? `Horses in ${country.name}` : "Country" };
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = getCountryByCode(code);
  if (!country) notFound();
  const supabase = await createClient();
  const cc = country.code;
  const [{ data: horses }, { data: clubs }, { data: trainers }] = await Promise.all([
    supabase.from("horses").select("id, title, photos, price, currency, city").eq("country_code", cc).eq("status", "published").limit(8),
    supabase.from("clubs").select("id, name, club_type, logo_url").eq("country_code", cc).eq("status", "published").limit(8),
    supabase.from("trainers").select("id, display_name, specialty, photos").eq("country_code", cc).eq("status", "published").limit(8),
  ]);

  return (
    <div className="space-y-8">
      <SectionHero
        title={country.name}
        subtitle={`Horse marketplace, clubs, and trainers in ${country.name}`}
        image={SECTION_IMAGES.countries}
      />
      <section>
        <h2 className="text-xl font-semibold">Horses</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {horses?.map((h) => (
            <ListingCard key={h.id} href={`/marketplace/horses/${h.id}`} title={h.title} image={Array.isArray(h.photos) ? h.photos[0] : null} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Clubs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clubs?.map((c) => (
            <ListingCard
              key={c.id}
              href={`/clubs/${c.id}`}
              title={c.name}
              subtitle={c.club_type ? c.club_type.replace(/_/g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()) : undefined}
              image={c.logo_url}
            />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Trainers</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainers?.map((t) => (
            <ListingCard
              key={t.id}
              href={`/trainers/${t.id}`}
              title={t.display_name}
              subtitle={t.specialty}
              image={Array.isArray(t.photos) ? t.photos[0] : null}
            />
          ))}
        </div>
      </section>
      <Link href="/payments" className="text-sm">Payment guidance for {country.name} →</Link>
    </div>
  );
}
