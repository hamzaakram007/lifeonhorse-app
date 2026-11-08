"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FeaturedRequestButton } from "@/components/FeaturedRequestButton";

export type OwnedListItem = {
  id: string;
  title: string;
  status?: string | null;
  href: string;
  editHref?: string | null;
  /** Secondary per-row action (e.g. Write event update). */
  actionHref?: string | null;
  actionLabel?: string | null;
  meta?: string | null;
  /** When set, show featured request CTA for this listing. */
  featureEntityType?: string | null;
  isFeatured?: boolean;
  featurePending?: boolean;
};

export function OwnedList({
  title,
  items,
  createHref,
  createLabel,
  emptyDescription,
}: {
  title: string;
  items: OwnedListItem[];
  createHref?: string;
  createLabel?: string;
  emptyDescription?: string;
}) {
  const t = useTranslations("Forms");

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {title} ({items.length})
        </h3>
        {createHref ? (
          <Link href={createHref} className="btn btn-primary inline-flex text-sm">
            {createLabel ?? t("new")}
          </Link>
        ) : null}
      </div>
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">
          {emptyDescription ?? t("nothingHere")}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <Link href={item.href} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-[var(--color-muted)]">
                  {[item.status, item.meta].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={item.href} className="text-[var(--color-primary)] hover:underline">
                  {t("view")}
                </Link>
                {item.editHref ? (
                  <Link href={item.editHref} className="text-[var(--color-primary)] hover:underline">
                    {t("edit")}
                  </Link>
                ) : null}
                {item.actionHref ? (
                  <Link
                    href={item.actionHref}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {item.actionLabel ?? t("update")}
                  </Link>
                ) : null}
                {item.featureEntityType ? (
                  <FeaturedRequestButton
                    entityType={item.featureEntityType}
                    entityId={item.id}
                    isFeatured={item.isFeatured}
                    hasPending={item.featurePending}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
