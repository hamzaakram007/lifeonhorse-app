import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Horse Health & Expert Help",
  description: "Connect with verified horse health experts worldwide.",
};

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: experts } = await supabase.from("experts").select("id, display_name, specialty, city, country_code, photos, is_verified, is_featured").eq("status", "published").limit(24);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-danger)] bg-red-50 p-4 text-sm">
        <strong>Emergency:</strong> LifeOnHorse is NOT for emergencies. Contact a licensed veterinarian immediately for colic, severe bleeding, or inability to stand.
        <Link href="/legal/health-disclaimer" className="ml-2 underline">Full disclaimer</Link>
      </div>
      <SectionHero
        title="Horse Health & Expert Help"
        subtitle="Vets, nutritionists, farriers, and specialists"
        image={SECTION_IMAGES.health}
        action={{ href: "/health/request", label: "Submit health request" }}
      />
      <div className="flex flex-wrap gap-2">
        <Link href="/health/experts/new" className="btn btn-secondary">Become an expert</Link>
      </div>
      {!experts?.length ? (
        <EmptyState title="No experts yet" action={<Link href="/health/experts/new" className="btn btn-primary">Register as expert</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ListingCard key={e.id} href={`/health/experts/${e.id}`} title={e.display_name} subtitle={e.specialty} image={Array.isArray(e.photos) ? e.photos[0] : null} badges={e.is_verified ? <VerifiedBadge /> : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
