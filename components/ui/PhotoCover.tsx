import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { SITE_IMAGES } from "@/lib/section-images";
import { cn } from "@/lib/utils";

type PhotoCoverProps = {
  photos?: unknown;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  /** @deprecated Prefer photographic fallback; ignored when a photo or default image is available. */
  fallback?: React.ReactNode;
};

export function PhotoCover({ photos, imageUrl, alt = "", className }: PhotoCoverProps) {
  const src = imageUrl ?? firstPhoto(photos) ?? SITE_IMAGES.fallbackEmpty;

  return (
    <div
      className={cn("bg-cover bg-center bg-stone-100", className)}
      style={{ backgroundImage: `url("${src}")` }}
      role="img"
      aria-label={alt}
    />
  );
}

export function PhotoGrid({ photos, className }: { photos?: unknown; className?: string }) {
  const list = parsePhotoList(photos);
  if (!list.length) return null;
  return (
    <div className={cn("mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {list.map((url) => (
        <div
          key={url}
          className="aspect-video rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url("${url}")` }}
        />
      ))}
    </div>
  );
}
