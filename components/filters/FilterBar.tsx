import Link from "next/link";
import { CountryFilterSelect } from "@/components/ui/CountrySelect";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export type FilterField =
  | {
      kind: "select";
      name: string;
      options: readonly FilterOption[] | FilterOption[];
      allLabel?: string;
      className?: string;
    }
  | {
      kind: "country";
      name?: string;
      className?: string;
    }
  | {
      kind: "text";
      name: string;
      placeholder?: string;
      className?: string;
    }
  | {
      kind: "number";
      name: string;
      placeholder?: string;
      min?: number;
      step?: string;
      className?: string;
    };

const controlClass =
  "rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]";

export function FilterBar({
  action,
  values,
  fields,
  submitLabel = "Filter",
  clearHref,
  className,
}: {
  action: string;
  values: Record<string, string | undefined>;
  fields: FilterField[];
  submitLabel?: string;
  clearHref?: string;
  className?: string;
}) {
  const hasActive = Object.values(values).some((v) => Boolean(v && String(v).trim()));

  const fieldNames = new Set(
    fields.map((field) => (field.kind === "country" ? field.name ?? "country" : field.name))
  );
  const hiddenValues = Object.entries(values).filter(
    ([name, value]) => Boolean(value?.trim()) && !fieldNames.has(name)
  );

  return (
    <form
      method="get"
      action={action}
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className
      )}
    >
      {hiddenValues.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {fields.map((field) => {
        if (field.kind === "country") {
          const name = field.name ?? "country";
          return (
            <CountryFilterSelect
              key={name}
              name={name}
              defaultValue={values[name] ?? ""}
              className={cn(controlClass, field.className)}
            />
          );
        }

        if (field.kind === "select") {
          return (
            <select
              key={field.name}
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              className={cn(controlClass, field.className)}
            >
              <option value="">{field.allLabel ?? "All"}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        if (field.kind === "number") {
          return (
            <input
              key={field.name}
              type="number"
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              placeholder={field.placeholder}
              min={field.min}
              step={field.step ?? "1"}
              className={cn(controlClass, "w-28", field.className)}
            />
          );
        }

        return (
          <input
            key={field.name}
            type="search"
            name={field.name}
            defaultValue={values[field.name] ?? ""}
            placeholder={field.placeholder}
            className={cn(controlClass, "min-w-[10rem] flex-1", field.className)}
          />
        );
      })}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary text-sm">
          {submitLabel}
        </button>
        {hasActive && clearHref ? (
          <Link href={clearHref} className="btn btn-secondary text-sm">
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
