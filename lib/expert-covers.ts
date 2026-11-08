import { firstPhoto, parsePhotoList } from "@/lib/storage/upload";
import { SITE_IMAGES } from "@/lib/section-images";

/** Owned equestrian covers for known live + seed expert rows. */
const COVER_BY_ID: Record<string, string> = {
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01": "/images/demo/expert-vet.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02": "/images/demo/expert-dressage.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03": "/images/demo/expert-nutrition.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb04": "/images/demo/expert-farrier.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb05": "/images/demo/expert-dental.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb06": "/images/demo/expert-reproduction.jpg",
};

const COVER_BY_NAME: Record<string, string> = {
  "dr. james whitfield": "/images/demo/expert-vet.jpg",
  "sarah mitchell": "/images/demo/expert-dressage.jpg",
  "dr. priya sharma": "/images/demo/expert-nutrition.jpg",
  "ahmed farooq": "/images/demo/expert-farrier.jpg",
  "dr. maria santos": "/images/demo/expert-dental.jpg",
  "dr. khalid al-rashid": "/images/demo/expert-reproduction.jpg",
  "dr. sana malik": "/images/demo/expert-clinic.jpg",
  "dr. mark hughes": "/images/demo/expert-rehab.jpg",
  "dr. elena rossi": "/images/demo/expert-lameness.jpg",
  "dr. sofia ahmed": "/images/demo/expert-behavior.jpg",
};

/** Specialty keyword → owned cover when name/id are unknown. */
const COVER_BY_SPECIALTY: { match: RegExp; img: string }[] = [
  { match: /veterinar|lameness|clinic/i, img: "/images/demo/expert-vet.jpg" },
  { match: /nutrition/i, img: "/images/demo/expert-nutrition.jpg" },
  { match: /farrier|hoof/i, img: "/images/demo/expert-farrier.jpg" },
  { match: /dent/i, img: "/images/demo/expert-dental.jpg" },
  { match: /reproduct|breed/i, img: "/images/demo/expert-reproduction.jpg" },
  { match: /rehab/i, img: "/images/demo/expert-rehab.jpg" },
  { match: /behavior|behav/i, img: "/images/demo/expert-behavior.jpg" },
  { match: /dressage|coach|train/i, img: "/images/demo/expert-dressage.jpg" },
  { match: /first.?aid|emergency/i, img: "/images/demo/expert-firstaid.jpg" },
];

const BAD_COVER_MARKERS = [
  "unsplash.com",
  "picsum.photos",
  "/images/demo/horse-",
  "/images/home/",
  "/images/sections/",
  "/images/demo/club-",
  "/images/demo/course-",
  "/images/demo/event-",
  "/images/demo/product-",
  "/images/demo/trainer-",
  "/images/demo/service-",
  "/images/blog/",
];

function normalizeName(name: string | null | undefined): string {
  return (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isWeakExpertCover(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return BAD_COVER_MARKERS.some((m) => u.includes(m));
}

function specialtyCover(specialty: string | null | undefined): string | null {
  if (!specialty?.trim()) return null;
  for (const row of COVER_BY_SPECIALTY) {
    if (row.match.test(specialty)) return row.img;
  }
  return null;
}

/** Prefer owned expert cover when DB still points at weak / mismatched assets. */
export function resolveExpertCover(
  id: string | null | undefined,
  name: string | null | undefined,
  photos?: unknown,
  specialty?: string | null,
): string {
  const mapped =
    (id && COVER_BY_ID[id]) ||
    COVER_BY_NAME[normalizeName(name)] ||
    specialtyCover(specialty);
  const fromPhotos = firstPhoto(photos);
  const candidate = fromPhotos?.trim() || null;

  if (mapped && isWeakExpertCover(candidate)) return mapped;
  if (candidate && !isWeakExpertCover(candidate)) return candidate;
  if (mapped) return mapped;
  return SITE_IMAGES.demo.expert1 || SITE_IMAGES.fallbackEmpty;
}

/** Gallery list with weak Unsplash/stock remapped to owned covers. */
export function resolveExpertPhotos(
  id: string | null | undefined,
  name: string | null | undefined,
  photos?: unknown,
  specialty?: string | null,
): string[] {
  const cover = resolveExpertCover(id, name, photos, specialty);
  const raw = parsePhotoList(photos);
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (url: string | null | undefined) => {
    const u = url?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(isWeakExpertCover(u) ? cover : u);
  };

  for (const p of raw) push(p);
  if (!out.length) push(cover);
  return [...new Set(out.length ? out : [cover])];
}
