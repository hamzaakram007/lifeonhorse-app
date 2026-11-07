import Link from "next/link";
import { ListingCard, FeaturedBadge } from "@/components/ui";

export type FeaturedCard = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  meta?: string;
};

export function FeaturedListings({
  title,
  viewAllHref,
  items,
}: {
  title: string;
  viewAllHref: string;
  items: FeaturedCard[];
}) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ListingCard
            key={item.id}
            href={item.href}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            meta={item.meta}
            badges={<FeaturedBadge />}
          />
        ))}
      </div>
    </section>
  );
}
