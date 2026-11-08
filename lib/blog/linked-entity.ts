export const BLOG_LINKED_ENTITY_TYPES = [
  "club",
  "trainer",
  "event",
  "course",
  "seller",
  "expert",
] as const;

export type BlogLinkedEntityType = (typeof BLOG_LINKED_ENTITY_TYPES)[number];

export function isBlogLinkedEntityType(value: string | null | undefined): value is BlogLinkedEntityType {
  return Boolean(value && (BLOG_LINKED_ENTITY_TYPES as readonly string[]).includes(value));
}
