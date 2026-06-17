import Link from "next/link";

const cards = [
  {
    title: "Horses for Sale",
    cta: "Browse Listings",
    href: "/marketplace/horses",
    image: "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Find Trainers and Services",
    cta: "Search Directory",
    href: "/trainers",
    image: "https://images.unsplash.com/photo-1503876466838-947ae2095810?w=800&h=600&fit=crop&fp-y=0.45&q=80",
  },
  {
    title: "Share Your Horse Life",
    cta: "Upload Content",
    href: "/community/gallery/new",
    image: "https://images.unsplash.com/photo-1509783230216-0b724a2771ec?w=800&h=600&fit=crop&q=80",
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
