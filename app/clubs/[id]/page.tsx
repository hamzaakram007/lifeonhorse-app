import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewsSection } from "@/components/ReviewsSection";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
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
  const { data: owner } = await supabase.from("profiles").select("id").eq("id", club.owner_id).single();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {club.is_verified ? <VerifiedBadge /> : null}
            {club.is_featured ? <FeaturedBadge /> : null}
            {typeLabel ? <span className="badge">{typeLabel}</span> : null}
          </div>
          <h1 className="font-serif text-3xl font-bold">{club.name}</h1>
          {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
          <ListingGallery photos={photos} alt={club.name} />
          {club.description ? <p className="leading-relaxed">{club.description}</p> : null}
          {(club.phone || club.email || club.website) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {club.phone ? (
                <a href={`tel:${club.phone}`} className="btn btn-secondary">
                  Call
                </a>
              ) : null}
              {club.email ? (
                <a href={`mailto:${club.email}`} className="btn btn-secondary">
                  Email
                </a>
              ) : null}
              {club.website ? (
                <a href={club.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Website
                </a>
              ) : null}
            </div>
          )}
          <ReviewsSection entityType="club" entityId={id} />
        </div>
        <div className="space-y-4">
          <FavoriteButton entityType="club" entityId={club.id} />
          {owner && <InquiryForm recipientId={owner.id} entityType="club" entityId={club.id} />}
        </div>
      </div>
    </div>
  );
}
