"use client";

import { useTranslations } from "next-intl";
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
  placeholder,
  className,
  defaultValue,
  disabled,
}: CountrySelectProps) {
  const t = useTranslations("Forms");
  const emptyLabel = placeholder ?? t("selectCountry");

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
      <option value="">{emptyLabel}</option>
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
  const t = useTranslations("Forms");

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={cn("rounded-lg border border-stone-300 px-3 py-2 text-sm", className)}
    >
      <option value="">{t("allCountries")}</option>
      {ALL_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
