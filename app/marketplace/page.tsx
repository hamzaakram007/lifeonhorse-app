import Link from "next/link";
import type { Metadata } from "next";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Marketplace",
  description: "Discover exceptional horses, premium tack, and trusted equestrian services worldwide.",
  path: "/marketplace",
});

const tabs = [
  { href: "/marketplace/horses", label: "Horses", desc: "Buy, sell, adopt, lease, and stud", createHref: "/marketplace/horses/new", createLabel: "List horse" },
  { href: "/marketplace/products", label: "Products", desc: "Premium tack, feed, and equipment", createHref: "/marketplace/products/new", createLabel: "List product" },
  { href: "/marketplace/services", label: "Services", desc: "Transport, farrier, and professional care", createHref: "/marketplace/services/new", createLabel: "List service" },
  { href: "/marketplace/sellers", label: "Sellers", desc: "Verified seller directory worldwide", createHref: "/marketplace/sellers/register", createLabel: "Register as seller" },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <SectionHero
        title="Global Horse Marketplace"
        subtitle="Discover exceptional horses, premium tack, and trusted equestrian services from verified sellers across six continents."
        image={SECTION_IMAGES.marketplace}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((t) => (
          <div key={t.href} className="card card-hover flex flex-col p-6">
            <Link href={t.href} className="no-underline hover:opacity-90">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-text)]">{t.label}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t.desc}</p>
            </Link>
            <Link href={t.createHref} className="btn btn-primary mt-5 text-sm">
              + {t.createLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
