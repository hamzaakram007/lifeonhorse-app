import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const year = new Date().getFullYear();

  const legalLinks = [
    { href: "/legal/terms", label: t("terms") },
    { href: "/legal/privacy", label: t("privacy") },
    { href: "/legal/cookies", label: t("cookies") },
    { href: "/legal/marketplace-safety", label: t("marketplaceSafety") },
    { href: "/legal/health-disclaimer", label: t("healthDisclaimer") },
    { href: "/legal/seller-buyer", label: t("sellerBuyer") },
  ] as const;

  const trustSignals = [
    { value: "120+", label: t("countries") },
    { value: "10K+", label: t("verifiedListings") },
    { value: t("secure"), label: t("securePayments") },
  ] as const;

  const explore = [
    { href: "/marketplace", label: tNav("marketplace") },
    { href: "/clubs", label: tNav("clubs") },
    { href: "/trainers", label: tNav("trainers") },
    { href: "/events", label: tNav("events") },
    { href: "/horse-health", label: tNav("horseHealth") },
    { href: "/payments", label: t("payments") },
    { href: "/support", label: t("support") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 py-6 sm:justify-between">
          {trustSignals.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-serif text-2xl font-bold text-[var(--color-primary)]">{s.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-bold text-[var(--color-primary)]">LifeOnHorse</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">{t("blurb")}</p>
          <form className="mt-4 flex max-w-sm gap-2" action="/api/newsletter" method="post">
            <input
              type="email"
              name="email"
              placeholder={t("newsletterEmail")}
              className="input flex-1 text-sm"
              aria-label={t("newsletterEmail")}
            />
            <button type="submit" className="btn btn-primary text-sm">
              {t("subscribe")}
            </button>
          </form>
        </div>
        <div>
          <p className="font-semibold">{t("explore")}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">{t("legal")}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-sm text-[var(--color-muted)]">
        {t("rights", { year })}
      </div>
    </footer>
  );
}
