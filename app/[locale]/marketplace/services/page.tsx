import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, FeaturedBadge } from "@/components/ui";
import { SectionHero } from "@/components/layout/SectionHero";
import { parsePhotoList } from "@/lib/storage/upload";
import { SECTION_IMAGES } from "@/lib/section-images";

export const metadata: Metadata = {
  title: "Services",
  description: "Horse services marketplace",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("id, title, price, currency, category, photos, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(24);

  const heroT = await getTranslations("Heroes.services");
  const commonT = await getTranslations("Common");
  const emptyT = await getTranslations("Empty");

  return (
    <div className="space-y-6">
      <SectionHero
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        image={SECTION_IMAGES.services}
        action={{ href: "/marketplace/services/new", label: commonT("listService") }}
      />
      {!data?.length ? (
        <EmptyState
          title={emptyT("noServices")}
          description={emptyT("beFirst")}
          action={
            <Link href="/marketplace/services/new" className="btn btn-primary">
              {commonT("listService")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => {
            const photoList = parsePhotoList(item.photos);
            return (
              <ListingCard
                key={String(item.id)}
                href={`/marketplace/services/${item.id}`}
                title={String(item.title)}
                subtitle={String(item.category ?? "")}
                image={photoList[0] ?? null}
                photoCount={photoList.length}
                badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                meta={item.price ? `${item.currency ?? "USD"} ${item.price}` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
