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
    <div className="empty-state card p-8">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      {description && <p className="mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
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

export function ListingCard({
  href,
  title,
  subtitle,
  image,
  badges,
  meta,
}: {
  href: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  badges?: React.ReactNode;
  meta?: string;
}) {
  return (
    <a href={href} className="card block no-underline transition hover:shadow-md">
      <div className="aspect-[4/3] bg-[var(--color-bg)]">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-muted)]">🐴</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">{badges}</div>
        <h3 className="mt-1 font-semibold text-[var(--color-text)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>}
        {meta && <p className="mt-2 text-sm font-medium">{meta}</p>}
      </div>
    </a>
  );
}
