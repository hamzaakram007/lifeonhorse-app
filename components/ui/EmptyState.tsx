import Link from "next/link";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center",
        className
      )}
    >
      <p className="text-lg font-medium text-stone-800">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-stone-500">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
