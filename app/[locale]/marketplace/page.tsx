import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHero } from "@/components/layout/SectionHero";
import { ListingCard, FeaturedBadge, EmptyState } from "@/components/ui";
import { SECTION_IMAGES } from "@/lib/section-images";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveProductCover, resolveProductPhotos } from "@/lib/product-covers";
import { parsePhotoList } from "@/lib/storage/upload";
import { formatLocation } from "@/lib/location";
import { formatPrice } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = buildMetadata({
  title: "Marketplace",
  description: "Discover exceptional horses, premium tack, and trusted equestrian services worldwide.",
  path: "/marketplace",
});

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Heroes.marketplace");
  const tabsT = await getTranslations("Heroes.marketplaceTabs");
  const c = await getTranslations("Common");
  const emptyT = await getTranslations("Empty");

  const supabase = await createClient();
  const [{ data: products }, { data: horses }] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, price, currency, category, photos, is_featured")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .limit(12),
    supabase
      .from("horses")
      .select("id, title, price, currency, city, country_code, photos, is_featured, breed")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .limit(8),
  ]);

  const tabs = [
    {
      href: "/marketplace/horses",
      label: tabsT("horses"),
      desc: tabsT("horsesDesc"),
      browseLabel: c("browseHorses"),
      createHref: "/marketplace/horses/new",
      createLabel: c("listHorse"),
    },
    {
      href: "/marketplace/products",
      label: tabsT("products"),
      desc: tabsT("productsDesc"),
      browseLabel: c("browseProducts"),
      createHref: "/marketplace/products/new",
      createLabel: c("listProduct"),
    },
    {
      href: "/marketplace/services",
      label: tabsT("services"),
      desc: tabsT("servicesDesc"),
      browseLabel: c("browseServices"),
      createHref: "/marketplace/services/new",
      createLabel: c("listService"),
    },
    {
      href: "/marketplace/sellers",
      label: tabsT("sellers"),
      desc: tabsT("sellersDesc"),
      browseLabel: c("browseSellers"),
      createHref: "/marketplace/sellers/register",
      createLabel: c("registerSeller"),
    },
  ];

  return (
    <div className="space-y-10">
      <SectionHero
        title={t("title")}
        subtitle={t("subtitle")}
        image={SECTION_IMAGES.marketplace}
        action={{ href: "/marketplace/products", label: c("browseProducts") }}
      />

      <nav aria-label={t("categoriesAria")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <div key={tab.href} className="flex flex-col border-b border-[var(--color-border)] pb-4">
            <Link href={tab.href} className="no-underline hover:opacity-90">
              <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">{tab.label}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{tab.desc}</p>
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href={tab.href} className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline">
                {tab.browseLabel}
              </Link>
              <Link
                href={tab.createHref}
                className="text-sm text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-text)] hover:underline"
              >
                + {tab.createLabel}
              </Link>
            </div>
          </div>
        ))}
      </nav>

      <section id="products" className="space-y-5 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              {t("productsHeading")}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("productsSub")}</p>
          </div>
          <Link
            href="/marketplace/products"
            className="shrink-0 text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
          >
            {c("viewAll")}
          </Link>
        </div>
        {!products?.length ? (
          <EmptyState
            title={emptyT("noProducts")}
            description={emptyT("beFirst")}
            action={
              <Link href="/marketplace/products/new" className="btn btn-primary">
                {c("listProduct")}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => {
              const id = String(item.id);
              const title = String(item.title);
              const photos = resolveProductPhotos(id, title, item.photos);
              return (
                <ListingCard
                  key={id}
                  href={`/marketplace/products/${id}`}
                  title={title}
                  subtitle={labelFromOptions(PRODUCT_CATEGORIES, String(item.category ?? ""))}
                  image={resolveProductCover(id, title, item.photos)}
                  photoCount={photos.length}
                  badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                  meta={item.price != null ? formatPrice(Number(item.price), String(item.currency ?? "USD")) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>

      <section id="horses" className="space-y-5 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              {t("horsesHeading")}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("horsesSub")}</p>
          </div>
          <Link
            href="/marketplace/horses"
            className="shrink-0 text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline"
          >
            {c("viewAll")}
          </Link>
        </div>
        {!horses?.length ? (
          <EmptyState
            title={emptyT("noHorses")}
            description={emptyT("noHorsesDesc")}
            action={
              <Link href="/marketplace/horses/new" className="btn btn-primary">
                {c("listHorse")}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {horses.map((item) => {
              const photos = parsePhotoList(item.photos);
              const place =
                formatLocation(item.city, item.country_code) ||
                (item.country_code ? getCountryName(String(item.country_code)) : undefined);
              return (
                <ListingCard
                  key={item.id}
                  href={`/marketplace/horses/${item.id}`}
                  title={item.title}
                  subtitle={item.breed || place || undefined}
                  image={photos[0]}
                  photoCount={photos.length}
                  badges={<>{item.is_featured ? <FeaturedBadge /> : null}</>}
                  meta={formatPrice(item.price, item.currency ?? "USD")}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
