export { escapeIlike } from "@/lib/filters/escape-ilike";

export type HorseSearchParams = {
  country?: string;
  breed?: string;
  listing_type?: string;
  discipline?: string;
  gender?: string;
  min_price?: string;
  max_price?: string;
  q?: string;
};

export function normalizeHorseSearchParams(
  raw: Record<string, string | string[] | undefined> | HorseSearchParams
): HorseSearchParams {
  const pick = (key: keyof HorseSearchParams) => {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };

  return {
    country: pick("country"),
    breed: pick("breed"),
    listing_type: pick("listing_type"),
    discipline: pick("discipline"),
    gender: pick("gender"),
    min_price: pick("min_price"),
    max_price: pick("max_price"),
    q: pick("q"),
  };
}

export function hasActiveHorseFilters(params: HorseSearchParams): boolean {
  return Object.values(params).some(Boolean);
}
