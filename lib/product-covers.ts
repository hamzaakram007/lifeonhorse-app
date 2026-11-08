import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { SITE_IMAGES } from "@/lib/section-images";

/** Owned product covers for known live + seed product rows. */
const COVER_BY_ID: Record<string, string> = {
  // Canonical demo seed products
  "d6666666-6666-4666-8666-666666666601": "/images/demo/product-saddle.jpg",
  "d6666666-6666-4666-8666-666666666602": "/images/demo/product-mallet.jpg",
  "d6666666-6666-4666-8666-666666666603": "/images/demo/product-feed.jpg",
  "d6666666-6666-4666-8666-666666666604": "/images/demo/product-supplement.jpg",
  "d6666666-6666-4666-8666-666666666605": "/images/demo/product-apparel.jpg",
  "d6666666-6666-4666-8666-666666666606": "/images/demo/product-helmet.jpg",
  "d6666666-6666-4666-8666-666666666607": "/images/demo/product-feed.jpg",
  "d6666666-6666-4666-8666-666666666608": "/images/demo/product-boots.jpg",
  "d6666666-6666-4666-8666-666666666609": "/images/demo/product-bridle.jpg",
  "d6666666-6666-4666-8666-666666666610": "/images/demo/product-blanket.jpg",
  "d6666666-6666-4666-8666-666666666611": "/images/demo/product-grooming.jpg",
  "d6666666-6666-4666-8666-666666666612": "/images/demo/product-stable-mat.jpg",
  "d6666666-6666-4666-8666-666666666613": "/images/demo/product-hoof.jpg",
  "d6666666-6666-4666-8666-666666666614": "/images/demo/product-saddle.jpg",
  "d6666666-6666-4666-8666-666666666615": "/images/demo/product-helmet.jpg",
  "d6666666-6666-4666-8666-666666666616": "/images/demo/product-feed.jpg",
  // Extra live product rows (legacy / alternate seeds)
  "d4444444-4444-4444-8444-444444444401": "/images/demo/product-saddle.jpg",
  "d4444444-4444-4444-8444-444444444402": "/images/demo/product-mallet.jpg",
  "d4444444-4444-4444-8444-444444444403": "/images/demo/product-grooming.jpg",
  "d4444444-4444-4444-8444-444444444404": "/images/demo/product-helmet.jpg",
  "d4444444-4444-4444-8444-444444444405": "/images/demo/product-supplement.jpg",
  "d4444444-4444-4444-8444-444444444406": "/images/demo/product-hoof.jpg",
  "d4444444-4444-4444-8444-444444444407": "/images/demo/product-blanket.jpg",
  "d4444444-4444-4444-8444-444444444408": "/images/demo/product-stable-mat.jpg",
  "1b3a56cd-2c05-4263-b289-2e8885181efb": "/images/demo/product-saddle.jpg",
  "07cdf22c-2979-461c-a60b-316d3e5678e0": "/images/demo/product-feed.jpg",
  "f054f4ec-c4ff-40bd-af9f-cd484d026869": "/images/demo/product-bridle.jpg",
  "6a30c8da-4461-4fcf-8ab8-9384339d3434": "/images/demo/product-helmet.jpg",
  "6057c5f1-c1ab-43b7-aa11-c6279d3d1490": "/images/demo/product-feed.jpg",
  "c120f3c2-b0bc-4a3f-a0bb-8dcf77bd4f37": "/images/demo/product-grooming.jpg",
};

const COVER_BY_TITLE: Record<string, string> = {
  "hand-stitched dressage saddle": "/images/demo/product-saddle.jpg",
  "premium english dressage saddle": "/images/demo/product-saddle.jpg",
  "english all-purpose saddle": "/images/demo/product-saddle.jpg",
  "western trail saddle — used": "/images/demo/product-saddle.jpg",
  "leather bridle set": "/images/demo/product-bridle.jpg",
  "swedish leather bridle with reins": "/images/demo/product-bridle.jpg",
  "astm certified riding helmet": "/images/demo/product-helmet.jpg",
  "riding helmet — astm certified": "/images/demo/product-helmet.jpg",
  "safety riding helmet — astm": "/images/demo/product-helmet.jpg",
  "vented jumping helmet": "/images/demo/product-helmet.jpg",
  "complete grooming kit": "/images/demo/product-grooming.jpg",
  "grooming kit — 8 piece": "/images/demo/product-grooming.jpg",
  "deluxe grooming tote": "/images/demo/product-grooming.jpg",
  "electrolyte supplement — 5kg": "/images/demo/product-supplement.jpg",
  "performance feed supplement": "/images/demo/product-supplement.jpg",
  "equine mineral salt block": "/images/demo/product-feed.jpg",
  "mineral salt block — 20kg": "/images/demo/product-feed.jpg",
  "premium alfalfa cubes — 25kg": "/images/demo/product-feed.jpg",
  "premium alfalfa hay bale": "/images/demo/product-feed.jpg",
  "timothy hay nets — pair": "/images/demo/product-feed.jpg",
  "leather polo boots — pair": "/images/demo/product-boots.jpg",
  "polo mallet set — pro grade": "/images/demo/product-mallet.jpg",
  "polo mallet set — professional": "/images/demo/product-mallet.jpg",
  "royal polo club blazer": "/images/demo/product-apparel.jpg",
  "hoof care maintenance kit": "/images/demo/product-hoof.jpg",
  "farrier hoof care bundle": "/images/demo/product-hoof.jpg",
  "stable rubber matting (4-pack)": "/images/demo/product-stable-mat.jpg",
  "interlocking stall mats — 4 pack": "/images/demo/product-stable-mat.jpg",
  "winter horse blanket — 200g fill": "/images/demo/product-blanket.jpg",
  "turnout blanket — waterproof": "/images/demo/product-blanket.jpg",
};

const BAD_COVER_MARKERS = [
  "unsplash.com",
  "picsum.photos",
  "/images/demo/horse-",
  "/images/demo/club-",
  "/images/demo/trainer-",
  "/images/demo/event-",
  "/images/demo/course-",
  "/images/home/",
  "/images/sections/services.jpg",
  "/images/sections/marketplace.jpg",
];

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isWeakProductCover(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return BAD_COVER_MARKERS.some((m) => u.includes(m));
}

/** Prefer owned product cover when DB still points at Unsplash / mismatched assets. */
export function resolveProductCover(
  id: string | null | undefined,
  title: string | null | undefined,
  photos?: unknown,
): string {
  const mapped = (id && COVER_BY_ID[id]) || COVER_BY_TITLE[normalizeTitle(title)];
  const candidate = firstPhoto(photos);

  if (mapped && isWeakProductCover(candidate)) return mapped;
  if (candidate && !isWeakProductCover(candidate)) return candidate;
  if (mapped) return mapped;
  return SITE_IMAGES.demo.product1;
}

/** Gallery list with weak covers remapped to owned product assets. */
export function resolveProductPhotos(
  id: string | null | undefined,
  title: string | null | undefined,
  photos?: unknown,
): string[] {
  const cover = resolveProductCover(id, title, photos);
  const list = parsePhotoList(photos).map((url) => (isWeakProductCover(url) ? cover : url));
  if (!list.length) return [cover];
  // Deduplicate while keeping order
  return [...new Set(list)];
}
