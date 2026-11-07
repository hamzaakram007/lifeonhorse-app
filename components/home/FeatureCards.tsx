import Link from "next/link";
import { SITE_IMAGES } from "@/lib/section-images";

const cards = [
  {
    title: "Horses for Sale",
    cta: "Browse Listings",
    href: "/marketplace/horses",
    image: SITE_IMAGES.home.featureHorses,
  },
  {
    title: "Find Trainers and Services",
    cta: "Search Directory",
    href: "/trainers",
    image: SITE_IMAGES.home.featureTrainers,
  },
  {
    title: "Share Your Horse Life",
    cta: "Upload Content",
    href: "/community/gallery/new",
    image: SITE_IMAGES.home.featureCommunity,
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 md:grid-cols-3 md:px-6">
      {cards.map((card) => (
        <div
          key={card.href}
          className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url("${card.image}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <div className="relative z-10 p-6">
            <h2 className="font-serif text-2xl font-bold text-white">{card.title}</h2>
            <Link
              href={card.href}
              className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-stone-900 no-underline transition hover:bg-stone-100"
            >
              {card.cta}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
