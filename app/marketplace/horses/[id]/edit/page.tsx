import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { HorseListingForm } from "@/components/marketplace/HorseListingForm";
import { parsePhotoList } from "@/lib/storage/upload";

export default async function EditHorsePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  if (!profile) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/marketplace/horses/${id}/edit`)}`);
  }

  const supabase = await createClient();
  const { data: horse } = await supabase.from("horses").select("*").eq("id", id).single();
  if (!horse) notFound();
  if (horse.owner_id !== profile.id && !["admin", "moderator"].includes(profile.role)) {
    redirect(`/marketplace/horses/${id}`);
  }

  const photos = parsePhotoList(horse.photos);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/marketplace/horses/${id}`}
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← Back to listing
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-bold">Edit horse listing</h1>
      <p className="text-sm text-stone-600">Update details, photos, and pricing.</p>
      <HorseListingForm
        mode="edit"
        horseId={horse.id}
        initialPhotos={photos}
        initialVideoUrl={horse.video_url ?? ""}
        initial={{
          title: horse.title ?? "",
          description: horse.description ?? "",
          breed: horse.breed ?? "",
          city: horse.city ?? "",
          country_code: horse.country_code ?? "PK",
          price: horse.price != null ? String(horse.price) : "",
          currency: horse.currency ?? "USD",
          listing_type: horse.listing_type ?? "sale",
          gender: horse.gender ?? "",
          age: horse.age != null ? String(horse.age) : "",
          discipline: horse.discipline ?? "",
          purpose: horse.purpose ?? "",
          height_cm: horse.height_cm != null ? String(horse.height_cm) : "",
          color: horse.color ?? "",
        }}
      />
    </div>
  );
}
