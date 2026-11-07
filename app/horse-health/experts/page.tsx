import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { CountryFilterSelect } from "@/components/ui/CountrySelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoCover } from "@/components/ui/PhotoCover";
import { getCountryName } from "@/lib/countries";
import { EXPERT_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Equine Experts" };

function specialtyFromCategory(value?: string) {
  if (!value) return null;
  return EXPERT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("experts")
    .select("id, display_name, specialty, city, country_code, photos, is_verified, is_featured, credentials")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.country) query = query.eq("country_code", params.country);
  const specialty = specialtyFromCategory(params.specialty);
  if (specialty) query = query.eq("specialty", specialty);

  const { data: experts } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/horse-health" className="text-sm text-emerald-800 hover:underline">← Horse Health</Link>
          <h1 className="mt-2 text-3xl font-bold">Equine Expert Directory</h1>
          <p className="text-stone-600">Vets, farriers, nutritionists, and specialists</p>
        </div>
        <Link href="/horse-health/experts/apply" className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900">
          + Apply as expert
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <CountryFilterSelect name="country" defaultValue={params.country ?? ""} />
        <select name="specialty" defaultValue={params.specialty ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All specialties</option>
          {EXPERT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white">Filter</button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experts?.map((e) => (
          <Card key={e.id} href={`/horse-health/experts/${e.id}`}>
            <PhotoCover photos={Array.isArray(e.photos) ? e.photos : []} alt={e.display_name} className="aspect-square rounded-lg" />
            <div className="mt-2 flex flex-wrap gap-1">
              {e.specialty ? <Badge>{e.specialty}</Badge> : null}
              {e.is_verified && <Badge variant="verified">Verified</Badge>}
              {e.is_featured && <Badge variant="featured">Featured</Badge>}
            </div>
            <h2 className="mt-2 font-semibold">{e.display_name}</h2>
            <p className="text-sm text-stone-600">
              {[e.city, getCountryName(e.country_code)].filter(Boolean).join(" · ") || "—"}
            </p>
          </Card>
        ))}
        {!experts?.length && (
          <EmptyState
            title="No experts found"
            description="Try adjusting filters or apply to join the expert directory."
            actionLabel="Apply as expert"
            actionHref="/horse-health/experts/apply"
          />
        )}
      </div>
    </div>
  );
}
