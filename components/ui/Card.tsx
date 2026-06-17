import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const inner = (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        href && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
  if (href) {
    return <a href={href}>{inner}</a>;
  }
  return inner;
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "featured" | "verified" | "warning";
}) {
  const styles = {
    default: "bg-stone-100 text-stone-700",
    featured: "bg-amber-100 text-amber-800",
    verified: "bg-emerald-100 text-emerald-800",
    warning: "bg-orange-100 text-orange-800",
  };
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
}
