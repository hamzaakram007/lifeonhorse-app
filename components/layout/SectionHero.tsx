import { Link } from "@/i18n/navigation";

type SectionHeroProps = {
  title: string;
  subtitle: string;
  image?: string;
  action?: { href: string; label: string };
  children?: React.ReactNode;
};

export function SectionHero({ title, subtitle, image, action, children }: SectionHeroProps) {
  return (
    <section
      className="section-hero relative -mx-4 mb-8 overflow-hidden rounded-2xl px-6 py-14 sm:-mx-0 sm:px-10 sm:py-16"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(135deg, rgb(44 24 16 / 0.82), rgb(196 92 38 / 0.55)), url("${image}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="relative z-10 max-w-2xl">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-white/90 sm:text-lg">{subtitle}</p>
        {action && (
          <Link href={action.href} className="hero-cta mt-6">
            {action.label}
          </Link>
        )}
        {children}
      </div>
    </section>
  );
}
