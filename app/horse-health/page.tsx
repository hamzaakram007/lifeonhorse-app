import Link from "next/link";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata = { title: "Horse Health & Expert Help" };

export default function HorseHealthPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SectionHero
        title="Horse Health & Expert Help"
        subtitle="Connect with verified equine experts and get guidance on horse health issues. For emergencies, contact a local veterinarian immediately."
        image={SECTION_IMAGES.health}
        action={{ href: "/horse-health/experts", label: "Find an expert" }}
      >
        <Link
          href="/horse-health/requests/new"
          className="mt-4 inline-flex rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-white/10"
        >
          Submit a health request
        </Link>
      </SectionHero>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Link
          href="/horse-health/experts"
          className="group relative overflow-hidden rounded-xl no-underline"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: 'url("/images/demo/expert-1.jpg")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/15" />
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-6 text-white">
            <h2 className="font-serif text-xl font-semibold">Expert Directory</h2>
            <p className="mt-2 text-sm text-white/85">
              Browse vets, farriers, nutrition experts, and other equine specialists. Filter by category and location.
            </p>
          </div>
        </Link>
        <Link
          href="/horse-health/requests/new"
          className="group relative overflow-hidden rounded-xl no-underline"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: 'url("/images/sections/health.jpg")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/15" />
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-6 text-white">
            <h2 className="font-serif text-xl font-semibold">Ask for Help</h2>
            <p className="mt-2 text-sm text-white/85">
              Describe your horse&apos;s symptoms, upload photos, and get connected with the right expert.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">Important safety notice</h3>
        <p className="mt-2 text-sm text-amber-800">
          <strong>Emergency:</strong> LifeOnHorse is NOT for emergencies and does not replace a licensed veterinarian.
          The information and expert listings on this platform are for guidance and coordination only.
          For emergencies — colic, severe bleeding, inability to stand, difficulty breathing, or any life-threatening condition —
          contact a local vet or emergency equine clinic immediately.{" "}
          <Link href="/legal/health-disclaimer" className="underline">
            Full disclaimer
          </Link>
        </p>
      </div>
    </div>
  );
}
