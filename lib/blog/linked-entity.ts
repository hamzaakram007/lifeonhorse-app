export const BLOG_LINKED_ENTITY_TYPES = [
  "club",
  "trainer",
  "event",
  "course",
  "seller",
  "expert",
] as const;

export type BlogLinkedEntityType = (typeof BLOG_LINKED_ENTITY_TYPES)[number];

/** Entity types that Slice F / P0–P1 composers can link today. */
export const BLOG_COMPOSER_ENTITY_TYPES = ["club", "trainer", "course"] as const;
export type BlogComposerEntityType = (typeof BLOG_COMPOSER_ENTITY_TYPES)[number];

export function isBlogLinkedEntityType(
  value: string | null | undefined
): value is BlogLinkedEntityType {
  return Boolean(value && (BLOG_LINKED_ENTITY_TYPES as readonly string[]).includes(value));
}

export function isBlogComposerEntityType(
  value: string | null | undefined
): value is BlogComposerEntityType {
  return Boolean(value && (BLOG_COMPOSER_ENTITY_TYPES as readonly string[]).includes(value));
}

export function defaultCategoryForLinkedEntity(
  type: BlogComposerEntityType | null | undefined
): string {
  switch (type) {
    case "club":
      return "club_activity";
    case "trainer":
      return "trainer_tips";
    case "course":
      return "course_updates";
    default:
      return "guides";
  }
}

export function linkedEntityHref(
  type: BlogLinkedEntityType | string | null | undefined,
  id: string
): string | null {
  switch (type) {
    case "club":
      return `/clubs/${id}`;
    case "trainer":
      return `/trainers/${id}`;
    case "course":
      return `/courses/${id}`;
    case "event":
      return `/events/${id}`;
    case "expert":
      return `/horse-health/experts/${id}`;
    case "seller":
      return `/marketplace/sellers/${id}`;
    default:
      return null;
  }
}

export function linkedEntityBadgeLabel(
  type: BlogLinkedEntityType | string | null | undefined
): string | null {
  switch (type) {
    case "club":
      return "Club update";
    case "trainer":
      return "Trainer tip";
    case "course":
      return "Course update";
    case "event":
      return "Event update";
    case "expert":
      return "Health tip";
    case "seller":
      return "Seller story";
    default:
      return null;
  }
}

export function linkedEntityFilterLabel(
  type: BlogComposerEntityType | string | null | undefined
): string {
  switch (type) {
    case "club":
      return "Club updates";
    case "trainer":
      return "Trainer tips";
    case "course":
      return "Course updates";
    default:
      return "Entity posts";
  }
}
