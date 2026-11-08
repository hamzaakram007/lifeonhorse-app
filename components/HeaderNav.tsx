"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const navHrefs = [
  { href: "/marketplace", key: "marketplace" as const },
  { href: "/horse-health", key: "horseHealth" as const },
  { href: "/clubs", key: "clubs" as const },
  { href: "/trainers", key: "trainers" as const },
  { href: "/events", key: "events" as const },
  { href: "/courses", key: "courses" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/community", key: "community" as const },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ variant }: { variant: "desktop" | "mobile" }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav
        className="flex gap-3 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 text-sm lg:hidden"
        aria-label={t("mobileAria")}
      >
        {navHrefs.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap no-underline ${isActive(pathname, link.href) ? "font-semibold text-[var(--color-primary)]" : ""}`}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
          >
            {t(link.key)}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="hidden flex-wrap gap-x-4 gap-y-1 text-sm font-medium lg:flex"
      aria-label={t("mainAria")}
    >
      {navHrefs.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`no-underline hover:text-[var(--color-primary-dark)] ${isActive(pathname, link.href) ? "font-semibold text-[var(--color-primary)]" : ""}`}
          aria-current={isActive(pathname, link.href) ? "page" : undefined}
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
