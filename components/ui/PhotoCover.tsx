import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { cn } from "@/lib/utils";

type PhotoCoverProps = {
  photos?: unknown;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
};

export function PhotoCover({ photos, imageUrl, alt = "", className, fallback }: PhotoCoverProps) {
  const src = imageUrl ?? firstPhoto(photos);
  if (src) {
    return (
      <div
        className={cn("bg-cover bg-center bg-stone-100", className)}
        style={{ backgroundImage: `url("${src}")` }}
        role="img"
        aria-label={alt}
      />
    );
  }
  return (
    <div className={cn("flex items-center justify-center bg-amber-50 text-5xl text-stone-400", className)}>
      {fallback ?? "🐴"}
    </div>
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
