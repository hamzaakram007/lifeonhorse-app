export type BlogSearchParams = {
  category?: string;
  club?: string;
  trainer?: string;
  course?: string;
  expert?: string;
  event?: string;
  entity_type?: string;
  featured?: string;
  q?: string;
};

const ENTITY_TYPES = new Set(["club", "trainer", "event", "course", "seller", "expert"]);

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
    expert: pick("expert"),
    event: pick("event"),
    entity_type: entityType && ENTITY_TYPES.has(entityType) ? entityType : undefined,
    q: pick("q"),
    featured: featured === "1" || featured === "true" ? "1" : undefined,
  };
}

export function hasActiveBlogFilters(params: BlogSearchParams): boolean {
  return Object.values(params).some(Boolean);
}
