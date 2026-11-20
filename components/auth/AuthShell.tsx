import { Link } from "@/i18n/navigation";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Shared auth composition — brand-forward, matches LifeOnHorse cream/terracotta language.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_50px_-28px_rgba(44,24,16,0.35)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(196,92,38,0.14),rgba(196,154,108,0.08)_45%,transparent)]"
      />
      <div className="relative px-6 pb-8 pt-10 sm:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-[var(--color-primary)] no-underline"
        >
          LifeOnHorse
        </Link>
        <h1 className="mt-6 font-serif text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
        <div className="mt-8">{children}</div>
        {footer ? (
          <div className="mt-6 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-muted)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthAlert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/8 text-[var(--color-success)]"
      : tone === "info"
        ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-text)]"
        : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 text-[var(--color-danger)]";

  return (
    <div role="alert" className={`rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}
