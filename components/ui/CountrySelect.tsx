import { ALL_COUNTRIES } from "@/lib/countries";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  value: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  name,
  id,
  required,
  placeholder = "Select country",
  className,
  defaultValue,
  disabled,
}: CountrySelectProps) {
  return (
    <Select
      id={id}
      name={name}
      value={onChange ? value : undefined}
      defaultValue={onChange ? undefined : (defaultValue ?? value)}
      required={required}
      disabled={disabled}
      className={cn(className)}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    >
      <option value="">{placeholder === "Select country" ? "— Select country —" : placeholder}</option>
      {ALL_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </Select>
  );
}

export function CountryFilterSelect({
  name = "country",
  defaultValue = "",
  className,
}: {
  name?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={cn("rounded-lg border border-stone-300 px-3 py-2 text-sm", className)}
    >
      <option value="">All countries</option>
      {ALL_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
