import { getCountryName } from "@/lib/countries";

export function formatLocation(city?: string | null, countryCode?: string | null) {
  const country = getCountryName(countryCode);
  if (city && countryCode) return `${city}, ${country}`;
  if (city) return city;
  if (countryCode) return country;
  return undefined;
}
