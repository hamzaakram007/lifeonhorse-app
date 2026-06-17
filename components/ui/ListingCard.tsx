import Image from "next/image";
import Link from "next/link";

export function ListingCard({
  href,
  title,
  subtitle,
  image,
  badges,
  meta,
  photoCount,
}: {
  href: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  badges?: React.ReactNode;
  meta?: string;
  photoCount?: number;
}) {
  return (
    <Link href={href} className="group card card-hover block overflow-hidden rounded-xl no-underline">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg)]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-[var(--color-muted)]">🐴</div>
        )}
        {photoCount && photoCount > 1 && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            +{photoCount - 1} photos
          </span>
        )}
        {meta && image && (
          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-sm font-semibold text-white">
            {meta}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">{badges}</div>
        <h3 className="mt-1 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>}
        {meta && !image && <p className="mt-2 text-sm font-medium">{meta}</p>}
      </div>
    </Link>
  );
}
