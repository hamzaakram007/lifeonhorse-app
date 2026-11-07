import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";
import { CLUB_TYPES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveClubPhotos } from "@/lib/club-covers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clubs").select("name").eq("id", id).single();
  return { title: data?.name ?? "Club" };
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: club } = await supabase.from("clubs").select("*").eq("id", id).single();
  if (!club) notFound();

  const typeLabel = labelFromOptions(CLUB_TYPES, club.club_type);
  const location = [club.city, getCountryName(club.country_code)].filter(Boolean).join(", ");
  const photos = resolveClubPhotos(club.id, club.name, club.photos, club.logo_url);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]} />
      <div className="flex flex-wrap gap-2">
        {club.is_verified ? <VerifiedBadge /> : null}
        {club.is_featured ? <FeaturedBadge /> : null}
        {typeLabel ? <span className="badge">{typeLabel}</span> : null}
      </div>
      <h1 className="font-serif text-3xl font-bold">{club.name}</h1>
      {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
      <ListingGallery photos={photos} alt={club.name} />
      {club.description ? <p className="leading-relaxed">{club.description}</p> : null}
      <ReviewsSection entityType="club" entityId={id} />
    </div>
  );
}
