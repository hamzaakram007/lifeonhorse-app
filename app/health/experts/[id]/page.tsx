import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import Link from "next/link";

export default async function ExpertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("id", id).single();
  if (!expert) notFound();

  return (
    <div className="space-y-6">
      <div className="flex gap-2">{expert.is_verified && <VerifiedBadge />}{expert.is_featured && <FeaturedBadge />}</div>
      <h1 className="text-3xl font-bold">{expert.display_name}</h1>
      <p className="text-[var(--color-muted)]">{expert.specialty}</p>
      <PhotoGallery photos={Array.isArray(expert.photos) ? expert.photos : []} />
      <p>{expert.description}</p>
      <p className="text-sm">{expert.credentials}</p>
      <Link href="/health/request" className="btn btn-primary inline-flex">Submit health request</Link>
      <ReviewsSection entityType="expert" entityId={id} />
    </div>
  );
}
