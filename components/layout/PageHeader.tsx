import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
