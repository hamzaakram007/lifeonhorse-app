export type BlogSearchParams = {
  category?: string;
  club?: string;
  trainer?: string;
  course?: string;
  entity_type?: string;
  featured?: string;
  q?: string;
};

const ENTITY_FILTER_TYPES = ["club", "trainer", "course", "event"] as const;

export function normalizeBlogSearchParams(
  raw: Record<string, string | string[] | undefined> | BlogSearchParams
): BlogSearchParams {
  const pick = (key: keyof BlogSearchParams) => {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };

  const featured = pick("featured");
  const entityType = pick("entity_type");
  return {
    category: pick("category"),
    club: pick("club"),
    trainer: pick("trainer"),
    course: pick("course"),
    entity_type:
      entityType && (ENTITY_FILTER_TYPES as readonly string[]).includes(entityType)
        ? entityType
        : undefined,
    q: pick("q"),
    featured: featured === "1" || featured === "true" ? "1" : undefined,
  };
}

export function hasActiveBlogFilters(params: BlogSearchParams): boolean {
  return Object.values(params).some(Boolean);
}
