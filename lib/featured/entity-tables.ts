/** Maps featured_listing_requests.entity_type → Supabase table with is_featured. */
export const FEATURED_ENTITY_TABLES: Record<string, string> = {
  horse: "horses",
  club: "clubs",
  trainer: "trainers",
  event: "events",
  course: "courses",
  product: "products",
  service: "services",
  seller: "seller_profiles",
  expert: "experts",
  blog_post: "blog_posts",
};

export function featuredEntityTable(entityType: string): string | null {
  return FEATURED_ENTITY_TABLES[entityType] ?? null;
}
