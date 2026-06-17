import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";

type DetailConfig = {
  table: string;
  titleField: string;
  entityType: string;
  photosFrom: (item: Record<string, unknown>) => string[];
};

export function createDetailPage(config: DetailConfig) {
  return async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: item } = await supabase.from(config.table).select("*").eq("id", id).single();
    if (!item) return null;
    const photos = config.photosFrom(item as Record<string, unknown>);
    const title = String((item as Record<string, unknown>)[config.titleField] ?? "Details");

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {(item as Record<string, unknown>).is_verified ? <VerifiedBadge /> : null}
          {(item as Record<string, unknown>).is_featured ? <FeaturedBadge /> : null}
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <PhotoGallery photos={photos} />
        <p>{String((item as Record<string, unknown>).description ?? (item as Record<string, unknown>).content ?? "")}</p>
        <ReviewsSection entityType={config.entityType} entityId={id} />
      </div>
    );
  };
}
