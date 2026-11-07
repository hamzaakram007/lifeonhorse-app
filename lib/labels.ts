/** Humanize DB enum/slug values for listing cards and UI. */

type Labeled = { readonly value: string; readonly label: string };

export function humanizeSlug(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function labelFromOptions(
  options: readonly Labeled[],
  value: string | null | undefined,
  fallbackHumanize = true,
): string {
  if (!value) return "";
  const match = options.find((o) => o.value === value);
  if (match) return match.label;
  return fallbackHumanize ? humanizeSlug(value) : value;
}

/** Drop subtitle when it already appears inside the title (e.g. "Sarah — Dressage" + "Dressage"). */
export function distinctSubtitle(
  title: string | null | undefined,
  subtitle: string | null | undefined,
): string | undefined {
  if (!subtitle) return undefined;
  if (!title) return subtitle;
  const t = title.toLowerCase();
  const s = subtitle.toLowerCase();
  if (t === s || t.includes(s)) return undefined;
  return subtitle;
}
