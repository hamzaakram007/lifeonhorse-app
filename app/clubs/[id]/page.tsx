import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";

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
  const photos = [...(club.logo_url ? [club.logo_url] : []), ...(Array.isArray(club.photos) ? club.photos : [])];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">{club.is_verified && <VerifiedBadge />}{club.is_featured && <FeaturedBadge />}</div>
      <h1 className="text-3xl font-bold">{club.name}</h1>
      <p className="text-[var(--color-muted)]">{club.club_type} · {[club.city, getCountryName(club.country_code)].filter(Boolean).join(", ")}</p>
      <PhotoGallery photos={photos} />
      <p>{club.description}</p>
      <ReviewsSection entityType="club" entityId={id} />
    </div>
  );
}
