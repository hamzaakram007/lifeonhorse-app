import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).single();
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{service.title}</h1>
      <p>{service.price ? `${service.currency} ${service.price}` : "Price on request"}</p>
      <PhotoGallery photos={Array.isArray(service.photos) ? service.photos : []} />
      <p>{service.description}</p>
      <ReviewsSection entityType="service" entityId={id} />
    </div>
  );
}
