import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export default async function FavoritesPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const t = await getTranslations("Dashboard");
  const commonT = await getTranslations("Common");
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("savedListings")}</h1>
      {!data?.length ? (
        <EmptyState
          title={t("noSaved")}
          action={
            <Link href="/marketplace" className="btn btn-primary">
              {commonT("browseMarketplace")}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {data.map((f) => (
            <li key={f.id} className="card p-3">
              <Link
                href={`/${f.entity_type === "horse" ? "marketplace/horses" : f.entity_type}s/${f.entity_id}`}
              >
                {f.entity_type} — view
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
