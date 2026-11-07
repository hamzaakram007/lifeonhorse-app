import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCountryName } from "@/lib/countries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("trainers").select("display_name").eq("id", id).single();
  return { title: data?.display_name ?? "Trainer" };
}

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trainer } = await supabase.from("trainers").select("*").eq("id", id).single();
  if (!trainer) notFound();

  const location = [trainer.city, getCountryName(trainer.country_code)].filter(Boolean).join(", ");
  const { data: owner } = await supabase.from("profiles").select("id").eq("id", trainer.user_id).single();
  const whatsappHref = trainer.phone
    ? `https://wa.me/${String(trainer.phone).replace(/[^\d]/g, "")}`
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2">
          {trainer.is_verified && <VerifiedBadge />}
          {trainer.is_featured && <FeaturedBadge />}
        </div>
        <h1 className="text-3xl font-bold">{trainer.display_name}</h1>
        <p className="text-[var(--color-muted)]">{trainer.specialty}</p>
        {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
        <PhotoGallery photos={Array.isArray(trainer.photos) ? trainer.photos : []} />
        <p>{trainer.description}</p>
        {(trainer.phone || whatsappHref) && (
          <div className="flex flex-wrap gap-3 text-sm">
            {trainer.phone ? (
              <a href={`tel:${trainer.phone}`} className="btn btn-secondary">
                Call
              </a>
            ) : null}
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                WhatsApp
              </a>
            ) : null}
          </div>
        )}
        <ReviewsSection entityType="trainer" entityId={id} />
      </div>
      <div className="space-y-4">
        <FavoriteButton entityType="trainer" entityId={trainer.id} />
        {owner && <InquiryForm recipientId={owner.id} entityType="trainer" entityId={trainer.id} />}
      </div>
    </div>
  );
}
