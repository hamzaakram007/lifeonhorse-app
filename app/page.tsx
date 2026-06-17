import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, FeaturedBadge } from "@/components/ui";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: horses }, { data: clubs }, { data: experts }] = await Promise.all([
    supabase.from("horses").select("id, title, price, currency, city, country_code, photos, is_featured").eq("status", "published").order("is_featured", { ascending: false }).limit(4),
    supabase.from("clubs").select("id, name, club_type, city, country_code, logo_url, is_featured, is_verified").eq("status", "published").order("is_featured", { ascending: false }).limit(4),
    supabase.from("experts").select("id, display_name, specialty, city, country_code, photos, is_verified, is_featured").eq("status", "published").limit(4),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-[#8b4513] to-[#5c2e0e] px-8 py-14 text-white">
        <h1 className="text-4xl font-bold md:text-5xl">Your global horse ecosystem</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          Marketplace, clubs, trainers, events, courses, community, and expert horse health help — worldwide.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/marketplace" className="btn bg-white text-[var(--color-primary)] hover:bg-white/90">
            Browse Marketplace
          </Link>
          <Link href="/health" className="btn btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
            Expert Health Help
          </Link>
          <Link href="/auth/signup" className="btn btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
            Join Free
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Horses</h2>
          <Link href="/marketplace/horses">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(horses ?? []).map((h) => (
            <ListingCard
              key={h.id}
              href={`/marketplace/horses/${h.id}`}
              title={h.title}
              subtitle={[h.city, h.country_code].filter(Boolean).join(", ")}
              image={Array.isArray(h.photos) ? h.photos[0] : null}
              badges={h.is_featured ? <FeaturedBadge /> : undefined}
              meta={h.price ? `${h.currency ?? "USD"} ${h.price}` : "Price on request"}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Clubs & Communities</h2>
          <Link href="/clubs">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(clubs ?? []).map((c) => (
            <ListingCard
              key={c.id}
              href={`/clubs/${c.id}`}
              title={c.name}
              subtitle={c.club_type}
              image={c.logo_url}
              badges={c.is_featured ? <FeaturedBadge /> : undefined}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Health Experts</h2>
          <Link href="/health">Find experts →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(experts ?? []).map((e) => (
            <ListingCard
              key={e.id}
              href={`/health/experts/${e.id}`}
              title={e.display_name}
              subtitle={e.specialty}
              image={Array.isArray(e.photos) ? e.photos[0] : null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
