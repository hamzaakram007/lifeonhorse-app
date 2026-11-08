"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { localeNames, locales, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("Language");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    if (next === locale || !(locales as readonly string[]).includes(next)) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("switchTo")}</span>
      <select
        className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pe-8 ps-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
        value={locale}
        disabled={pending}
        aria-label={t("label")}
        onChange={(e) => onChange(e.target.value)}
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
      >
        ▾
      </span>
    </label>
  );
}
