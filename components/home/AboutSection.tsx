const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=600&fit=crop&q=80";

export function AboutSection() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">About Us</h2>
        <p className="mt-5 text-base leading-relaxed text-stone-600">
          LifeOnHorse is a global online community for horse enthusiasts — connecting riders,
          breeders, clubs, and professionals worldwide. Browse our marketplace for horses, tack,
          and services; discover trainers and clubs in your region; share your horse life with
          the community; and access expert health guidance when you need it.
        </p>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          Whether you are buying your first horse, running a polo club, or seeking a farrier in a
          new country, LifeOnHorse brings the equestrian world together in one trusted place.
        </p>
      </div>
      <div
        className="aspect-[4/3] w-full rounded-2xl bg-cover bg-center shadow-md"
        style={{ backgroundImage: `url("${ABOUT_IMAGE}")` }}
        role="img"
        aria-label="Horses grazing together"
      />
    </section>
  );
}
