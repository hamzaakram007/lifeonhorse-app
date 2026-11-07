export type EventSearchParams = {
  country?: string;
  event_type?: string;
  q?: string;
  featured?: string;
};

export function normalizeEventSearchParams(
  raw: Record<string, string | string[] | undefined> | EventSearchParams
): EventSearchParams {
  const pick = (key: keyof EventSearchParams) => {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };

  const featured = pick("featured");
  return {
    country: pick("country"),
    event_type: pick("event_type"),
    q: pick("q"),
    featured: featured === "1" || featured === "true" ? "1" : undefined,
  };
}

export function hasActiveEventFilters(params: EventSearchParams): boolean {
  return Object.values(params).some(Boolean);
}
