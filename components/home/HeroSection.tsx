import Link from "next/link";
import { SITE_IMAGES } from "@/lib/section-images";

const HERO_IMAGE = SITE_IMAGES.home.hero;

export function HeroSection() {
  return (
    <section className="relative -mx-4 flex min-h-[70vh] items-center overflow-hidden sm:-mx-[max(1rem,calc((100vw-80rem)/2+1rem))] md:min-h-[75vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        role="img"
        aria-label="Horse in golden field"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/20" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:px-10">
        <p className="mb-3 font-serif text-sm font-semibold tracking-[0.2em] text-white/85 uppercase">
          LifeOnHorse
        </p>
        <h1 className="font-serif text-4xl font-bold leading-tight text-white md:max-w-2xl md:text-5xl lg:text-6xl">
          Where Every Journey Begins with a Horse
        </h1>
        <Link href="/marketplace" className="hero-cta">
          Explore Now
        </Link>
      </div>
    </section>
  );
}
