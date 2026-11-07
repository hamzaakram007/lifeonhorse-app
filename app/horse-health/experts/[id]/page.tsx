import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Card";
import { ListingGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";

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
  const photos = Array.isArray(expert.photos) ? expert.photos : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link href="/horse-health/experts" className="text-sm text-emerald-800 hover:underline">
        ← Back to experts
      </Link>

      <div className="flex flex-wrap gap-2">
        {expert.is_verified ? <VerifiedBadge /> : null}
        {expert.is_featured ? <FeaturedBadge /> : null}
        {expert.specialty ? <Badge>{expert.specialty}</Badge> : null}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{expert.display_name}</h1>
        {location ? <p className="mt-1 text-stone-600">{location}</p> : null}
      </div>

      <ListingGallery photos={photos} alt={expert.display_name} />

      {expert.description ? <p className="leading-relaxed whitespace-pre-wrap">{expert.description}</p> : null}

      {expert.credentials ? (
        <div>
          <h2 className="font-semibold">Credentials</h2>
          <p className="mt-1 text-sm text-stone-700 whitespace-pre-wrap">{expert.credentials}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Safety notice:</strong> Expert listings are for guidance and coordination only. LifeOnHorse is not for
        emergencies and does not replace a licensed veterinarian.{" "}
        <Link href="/legal/health-disclaimer" className="underline">
          Full disclaimer
        </Link>
      </div>

      <Link
        href={`/horse-health/requests/new?expert_id=${expert.id}`}
        className="inline-flex rounded-lg bg-emerald-800 px-5 py-2.5 font-medium text-white hover:bg-emerald-900"
      >
        Submit health request to this expert
      </Link>

      <ReviewsSection entityType="expert" entityId={id} />
    </div>
  );
}
