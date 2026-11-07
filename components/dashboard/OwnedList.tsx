import Link from "next/link";

export type OwnedListItem = {
  id: string;
  title: string;
  status?: string | null;
  href: string;
  editHref?: string | null;
  meta?: string | null;
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
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">
          {title} ({items.length})
        </h3>
        {createHref ? (
          <Link href={createHref} className="btn btn-primary inline-flex text-sm">
            {createLabel ?? "+ New"}
          </Link>
        ) : null}
      </div>
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">
          {emptyDescription ?? "Nothing here yet."}
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
              <div className="flex flex-wrap gap-3">
                <Link href={item.href} className="text-[var(--color-primary)] hover:underline">
                  View
                </Link>
                {item.editHref ? (
                  <Link href={item.editHref} className="text-[var(--color-primary)] hover:underline">
                    Edit
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
