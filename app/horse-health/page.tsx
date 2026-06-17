import Link from "next/link";

export const metadata = { title: "Horse Health & Expert Help" };

export default function HorseHealthPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 px-8 py-12 text-white">
        <h1 className="text-4xl font-bold">Horse Health & Expert Help</h1>
        <p className="mt-4 max-w-2xl text-lg text-emerald-100">
          Connect with verified equine experts and get guidance on horse health issues. For emergencies, contact a local veterinarian immediately.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/horse-health/experts" className="rounded-lg bg-white px-5 py-2.5 font-medium text-emerald-900 hover:bg-emerald-50">
            Find an expert
          </Link>
          <Link href="/horse-health/requests/new" className="rounded-lg border border-white/40 px-5 py-2.5 font-medium text-white hover:bg-white/10">
            Submit a health request
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Link href="/horse-health/experts" className="rounded-xl border border-stone-200 bg-white p-6 transition hover:shadow-md">
          <span className="text-3xl">🩺</span>
          <h2 className="mt-3 text-xl font-semibold">Expert Directory</h2>
          <p className="mt-2 text-stone-600">
            Browse vets, farriers, nutrition experts, and other equine specialists. Filter by category and location.
          </p>
        </Link>
        <Link href="/horse-health/requests/new" className="rounded-xl border border-stone-200 bg-white p-6 transition hover:shadow-md">
          <span className="text-3xl">🐴</span>
          <h2 className="mt-3 text-xl font-semibold">Ask for Help</h2>
          <p className="mt-2 text-stone-600">
            Describe your horse&apos;s symptoms, upload photos, and get connected with the right expert.
          </p>
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">Important safety notice</h3>
        <p className="mt-2 text-sm text-amber-800">
          LifeOnHorse does not replace a licensed veterinarian. The information and expert listings on this platform are for guidance and coordination only.
          For emergencies — colic, severe injury, difficulty breathing, or any life-threatening condition — contact a local vet or emergency equine clinic immediately.
        </p>
      </div>
    </div>
  );
}
