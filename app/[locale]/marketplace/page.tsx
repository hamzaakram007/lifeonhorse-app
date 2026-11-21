import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHero } from "@/components/layout/SectionHero";
import { SECTION_IMAGES } from "@/lib/section-images";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";

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
    <div className="space-y-8">
      <SectionHero
        title={t("title")}
        subtitle={t("subtitle")}
        image={SECTION_IMAGES.marketplace}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <div key={tab.href} className="card card-hover flex flex-col p-6">
            <Link href={tab.href} className="no-underline hover:opacity-90">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-text)]">{tab.label}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{tab.desc}</p>
            </Link>
            <Link href={tab.href} className="btn btn-primary mt-5 text-sm">
              {tab.browseLabel}
            </Link>
            <Link
              href={tab.createHref}
              className="mt-3 text-center text-sm text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-text)] hover:underline"
            >
              + {tab.createLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
