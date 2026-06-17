export function VerifiedBadge() {
  return <span className="badge badge-verified">✓ Verified</span>;
}

export function FeaturedBadge() {
  return <span className="badge badge-featured">★ Featured</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state card p-10">
      <div className="mx-auto mb-4 text-5xl opacity-60" aria-hidden>
        🐴
      </div>
      <h3 className="font-serif text-xl font-semibold text-[var(--color-text)]">{title}</h3>
      {description && <p className="mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
    </div>
  );
}

export function PhotoGallery({ photos }: { photos: string[] }) {
  if (!photos?.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-muted)]">
        No photos
      </div>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((url, i) => (
        <img
          key={url + i}
          src={url}
          alt={`Photo ${i + 1}`}
          className="h-48 w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}

export { ListingCard } from "@/components/ui/ListingCard";
export { ListingGallery } from "@/components/ui/ListingGallery";
