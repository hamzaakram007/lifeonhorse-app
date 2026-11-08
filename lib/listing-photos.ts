/** Detect remote demo placeholders that commonly 404 via `/_next/image`. */
const BROKEN_REMOTE_MARKERS = ["unsplash.com", "picsum.photos"] as const;

export function isBrokenRemotePhoto(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return BROKEN_REMOTE_MARKERS.some((m) => u.includes(m));
}

/** Prefer a usable local/remote photo; drop known-dead Unsplash/Picsum URLs. */
export function safeListingImage(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  if (isBrokenRemotePhoto(url)) return null;
  return url.trim();
}

/** Filter photo arrays so galleries never request dead Unsplash IDs. */
export function safePhotoList(photos: unknown): string[] {
  if (!photos) return [];
  const list = Array.isArray(photos) ? photos : typeof photos === "string" ? [photos] : [];
  return list.filter((v): v is string => typeof v === "string" && v.length > 0 && !isBrokenRemotePhoto(v));
}
