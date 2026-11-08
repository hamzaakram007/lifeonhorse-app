import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";
import { resolveExpertPhotos } from "@/lib/expert-covers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("display_name").eq("id", id).single();
  return { title: data?.display_name ?? "Expert" };
}

export default async function ExpertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("id", id).single();
  if (!expert) notFound();

  const location = [expert.city, getCountryName(expert.country_code)].filter(Boolean).join(", ");
  const photos = resolveExpertPhotos(
    expert.id,
    expert.display_name,
    expert.photos,
    expert.specialty,
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Horse Health", href: "/horse-health" },
          { label: "Experts", href: "/horse-health/experts" },
          { label: expert.display_name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {expert.is_verified ? <VerifiedBadge /> : null}
            {expert.is_featured ? <FeaturedBadge /> : null}
            {expert.specialty ? <span className="badge">{expert.specialty}</span> : null}
          </div>

          <h1 className="font-serif text-3xl font-bold">{expert.display_name}</h1>
          {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}

          <ListingGallery photos={photos} alt={expert.display_name} />

          {expert.description ? (
            <p className="leading-relaxed whitespace-pre-wrap">{expert.description}</p>
          ) : null}

          {expert.credentials ? (
            <div>
              <h2 className="font-semibold">Credentials</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)] whitespace-pre-wrap">
                {expert.credentials}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">
            <strong>Safety notice:</strong> Expert listings are for guidance and coordination only.
            LifeOnHorse is not for emergencies and does not replace a licensed veterinarian.{" "}
            <Link href="/legal/health-disclaimer" className="underline">
              Full disclaimer
            </Link>
          </div>

          <ReviewsSection entityType="expert" entityId={id} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-serif text-lg font-semibold">Need guidance?</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Submit a health request and this expert can review your horse&apos;s case.
            </p>
            <Link
              href={`/horse-health/requests/new?expert_id=${expert.id}`}
              className="btn btn-primary mt-4 inline-flex w-full justify-center"
            >
              Submit health request
            </Link>
            <Link
              href="/horse-health/experts"
              className="btn btn-secondary mt-3 inline-flex w-full justify-center"
            >
              Browse more experts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
