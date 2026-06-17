import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--color-muted)]">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="no-underline hover:text-[var(--color-primary)]">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <span aria-hidden className="opacity-50">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="no-underline hover:text-[var(--color-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--color-text)]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
