import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { CountryFilterSelect } from "@/components/ui/CountrySelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoCover } from "@/components/ui/PhotoCover";
import { countryLabel } from "@/lib/utils";
import { EXPERT_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Equine Experts" };

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("experts")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.country) query = query.eq("country", params.country);
  if (params.category) query = query.eq("category", params.category);

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
        <CountryFilterSelect defaultValue={params.country ?? ""} />
        <select name="category" defaultValue={params.category ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All categories</option>
          {EXPERT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white">Filter</button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experts?.map((e) => (
          <Card key={e.id} href={`/horse-health/experts/${e.slug}`}>
            <PhotoCover photos={e.avatar_url ? [e.avatar_url] : e.photos} alt={e.name} className="aspect-square rounded-lg" />
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge>{e.category.replace(/_/g, " ")}</Badge>
              {e.is_verified && <Badge variant="verified">Verified</Badge>}
              {e.emergency_available && <Badge variant="featured">Emergency</Badge>}
            </div>
            <h2 className="mt-2 font-semibold">{e.name}</h2>
            <p className="text-sm text-stone-600">{e.specialization ?? e.clinic_name} · {countryLabel(e.country)}</p>
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
