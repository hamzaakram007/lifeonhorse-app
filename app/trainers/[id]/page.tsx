import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";

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

  return (
    <div className="space-y-6">
      <div className="flex gap-2">{trainer.is_verified && <VerifiedBadge />}{trainer.is_featured && <FeaturedBadge />}</div>
      <h1 className="text-3xl font-bold">{trainer.display_name}</h1>
      <p className="text-[var(--color-muted)]">{trainer.specialty}</p>
      <PhotoGallery photos={Array.isArray(trainer.photos) ? trainer.photos : []} />
      <p>{trainer.description}</p>
      <ReviewsSection entityType="trainer" entityId={id} />
    </div>
  );
}
