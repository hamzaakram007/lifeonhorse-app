"use client";

import { useTranslations } from "next-intl";

export function VerifiedBadge() {
  const t = useTranslations("Common");
  return <span className="badge badge-verified">✓ {t("verified")}</span>;
}

export function FeaturedBadge() {
  const t = useTranslations("Common");
  return <span className="badge badge-featured">★ {t("featured")}</span>;
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
      <div
        className="mx-auto mb-4 h-28 w-full max-w-xs rounded-xl bg-cover bg-center opacity-90"
        style={{ backgroundImage: 'url("/images/fallback-empty.jpg")' }}
        aria-hidden
      />
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
  const t = useTranslations("Common");
  const unique = [...new Set((photos ?? []).map((p) => p?.trim()).filter(Boolean))];
  if (!unique.length) {
    return (
      <div
        className="flex h-48 items-center justify-center rounded-lg bg-cover bg-center text-[var(--color-muted)]"
        style={{ backgroundImage: 'url("/images/fallback-empty.jpg")' }}
      >
        {t("noPhotos")}
      </div>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {unique.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url + i}
          src={url}
          alt={t("photoAlt", { n: i + 1 })}
          className="aspect-[4/3] h-auto w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}

export { ListingCard } from "@/components/ui/ListingCard";
export { ListingGallery } from "@/components/ui/ListingGallery";
