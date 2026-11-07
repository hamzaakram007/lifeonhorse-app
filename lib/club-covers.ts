import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { SITE_IMAGES } from "@/lib/section-images";

/** Owned equestrian covers for known live + seed club rows. */
const COVER_BY_ID: Record<string, string> = {
  // Canonical demo seed clubs
  "d4444444-4444-4444-8444-444444444401": "/images/demo/club-polo.jpg",
  "d4444444-4444-4444-8444-444444444402": "/images/demo/club-tent.jpg",
  "d4444444-4444-4444-8444-444444444403": "/images/demo/club-riding.jpg",
  "d4444444-4444-4444-8444-444444444404": "/images/demo/club-sports.jpg",
  "d4444444-4444-4444-8444-444444444405": "/images/demo/club-community.jpg",
  "d4444444-4444-4444-8444-444444444406": "/images/demo/club-rescue.jpg",
  // Extra live clubs with distinct identities
  "544cb6be-4210-4c81-8427-c6887f13ebbe": "/images/demo/club-1.jpg",
  "7be1fb42-2b01-4316-84e2-7511f84d4eeb": "/images/sections/clubs.jpg",
  "de6c35f5-ce68-4f27-abd5-c61338ddcc61": "/images/demo/club-cape.jpg",
  "633c9b47-ccae-4053-b16d-503923513e20": "/images/demo/club-mumbai.jpg",
  "d6666666-6666-4666-8666-666666666604": "/images/demo/club-hanover.jpg",
  "d6666666-6666-4666-8666-666666666606": "/images/demo/club-breeding.jpg",
  // Near-duplicate orphan rows — still resolve if visited by URL
  "d6666666-6666-4666-8666-666666666601": "/images/demo/event-polo.jpg",
  "d6666666-6666-4666-8666-666666666602": "/images/demo/club-cape-park.jpg",
  "d6666666-6666-4666-8666-666666666603": "/images/demo/course-dressage.jpg",
  "d6666666-6666-4666-8666-666666666605": "/images/demo/club-rescue.jpg",
};

const COVER_BY_NAME: Record<string, string> = {
  "royal polo club buenos aires": "/images/demo/club-polo.jpg",
  "royal buenos aires polo club": "/images/demo/event-polo.jpg",
  "frontier tent pegging club": "/images/demo/club-tent.jpg",
  "frontier tent pegging association": "/images/demo/club-cape-park.jpg",
  "newmarket riding academy": "/images/demo/club-riding.jpg",
  "lahore equestrian centre": "/images/demo/club-sports.jpg",
  "kentucky horse park community": "/images/demo/club-community.jpg",
  "cape equine rescue": "/images/demo/club-rescue.jpg",
  "cape equine rescue sanctuary": "/images/demo/club-rescue.jpg",
  "istanbul riding academy": "/images/demo/club-1.jpg",
  "lahore polo & equestrian club": "/images/sections/clubs.jpg",
  "cape town horse park": "/images/demo/club-cape.jpg",
  "mumbai equestrian centre": "/images/demo/club-mumbai.jpg",
  "hanover equestrian sports club": "/images/demo/club-hanover.jpg",
  "punjab arabian breeders association": "/images/demo/club-breeding.jpg",
};

/**
 * Orphan product-UUID club rows that duplicate canonical seed clubs.
 * Hidden from the listing grid until cleaned in the live DB.
 */
export const DUPLICATE_CLUB_IDS = new Set([
  "d6666666-6666-4666-8666-666666666601", // Royal Buenos Aires Polo Club
  "d6666666-6666-4666-8666-666666666602", // Frontier Tent Pegging Association
  "d6666666-6666-4666-8666-666666666603", // Newmarket Riding Academy
  "d6666666-6666-4666-8666-666666666605", // Cape Equine Rescue Sanctuary
]);

const BAD_COVER_MARKERS = [
  "unsplash.com",
  "picsum.photos",
  "/images/demo/horse-",
  "/images/home/",
  "/images/sections/events.jpg",
  "/images/sections/marketplace.jpg",
  "/images/demo/course-",
  "/images/demo/event-",
  "/images/demo/product-",
  "/images/demo/trainer-",
];

function normalizeName(name: string | null | undefined): string {
  return (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isWeakClubCover(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return BAD_COVER_MARKERS.some((m) => u.includes(m));
}

/** Prefer owned club cover when DB still points at weak / mismatched assets. */
export function resolveClubCover(
  id: string | null | undefined,
  name: string | null | undefined,
  photos?: unknown,
  logoUrl?: string | null,
): string {
  const mapped = (id && COVER_BY_ID[id]) || COVER_BY_NAME[normalizeName(name)];
  const fromPhotos = firstPhoto(photos);
  const candidate = fromPhotos ?? logoUrl?.trim() ?? null;

  if (mapped && isWeakClubCover(candidate)) return mapped;
  if (candidate && !isWeakClubCover(candidate)) return candidate;
  if (mapped) return mapped;
  return SITE_IMAGES.fallbackEmpty;
}

/** Deduped gallery list: photos first, then logo if distinct; remap weak covers. */
export function resolveClubPhotos(
  id: string | null | undefined,
  name: string | null | undefined,
  photos?: unknown,
  logoUrl?: string | null,
): string[] {
  const cover = resolveClubCover(id, name, photos, logoUrl);
  const raw = parsePhotoList(photos);
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (url: string | null | undefined) => {
    const u = url?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(isWeakClubCover(u) ? cover : u);
  };

  for (const p of raw) push(p);
  push(logoUrl);
  if (!out.length) push(cover);
  // If everything collapsed to the same remapped URL, keep a single entry
  return [...new Set(out.length ? out : [cover])];
}
