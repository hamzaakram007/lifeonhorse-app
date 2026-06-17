import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("horses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Horse Listing" };
}

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: horse } = await supabase.from("horses").select("*").eq("id", id).single();
  if (!horse) notFound();
  const { data: owner } = await supabase.from("profiles").select("id, full_name, email").eq("id", horse.owner_id).single();

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {horse.is_featured && <FeaturedBadge />}
        <h1 className="text-3xl font-bold">{horse.title}</h1>
        <p className="text-[var(--color-muted)]">{[horse.city, getCountryName(horse.country_code)].filter(Boolean).join(", ")}</p>
        <PhotoGallery photos={Array.isArray(horse.photos) ? horse.photos : []} />
        <p>{horse.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="font-semibold">Breed</dt><dd>{horse.breed ?? "—"}</dd></div>
          <div><dt className="font-semibold">Age</dt><dd>{horse.age ?? "—"}</dd></div>
          <div><dt className="font-semibold">Gender</dt><dd>{horse.gender ?? "—"}</dd></div>
          <div><dt className="font-semibold">Price</dt><dd>{horse.price ? `${horse.currency} ${horse.price}` : "On request"}</dd></div>
        </dl>
      </div>
      <div className="space-y-4">
        <FavoriteButton entityType="horse" entityId={horse.id} />
        {owner && <InquiryForm recipientId={owner.id} entityType="horse" entityId={horse.id} />}
      </div>
    </div>
  );
}
