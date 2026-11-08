import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export default function CountriesIndexPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Browse by country"
        subtitle="Discover horses, clubs, and trainers across the LifeOnHorse network"
        image={SECTION_IMAGES.countries}
      />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {COUNTRIES.map((c) => (
          <Link key={c.code} href={`/countries/${c.code}`} className="card p-3 text-sm no-underline hover:shadow-md">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
