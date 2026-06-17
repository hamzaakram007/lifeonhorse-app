import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, FeaturedBadge } from "@/components/ui";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  return (
    <div className="space-y-6">
      {event.is_featured && <FeaturedBadge />}
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-[var(--color-muted)]">{event.event_type} · {event.start_date ? new Date(event.start_date).toLocaleDateString() : ""}</p>
      <PhotoGallery photos={Array.isArray(event.photos) ? event.photos : []} />
      <p>{event.description}</p>
    </div>
  );
}
