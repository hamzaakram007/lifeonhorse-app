import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Reconnect to browse LifeOnHorse.",
  robots: { index: false, follow: false },
};

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Offline");
  const brand = await getTranslations("Brand");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-2 text-center">
      <p className="font-serif text-3xl font-bold tracking-tight text-[var(--color-primary)]">
        {brand("name")}
      </p>
      <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">{t("body")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          {t("tryHome")}
        </Link>
        <a href="?reload=1" className="btn btn-secondary">
          {t("reload")}
        </a>
      </div>
    </div>
  );
}
