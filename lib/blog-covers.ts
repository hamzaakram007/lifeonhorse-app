/** Owned equestrian covers keyed by published blog title (live + seed). */
const COVER_BY_TITLE: Record<string, string> = {
  "Tent Pegging: A Complete Guide": "/images/blog/blog-tent-pegging-guide.jpg",
  "Buying Arabian Horses: Expert Advice": "/images/blog/blog-buying-arabian.jpg",
  "Polo Training Basics for New Riders": "/images/blog/blog-polo-training.jpg",
  "Essential Tips for First-Time Horse Buyers": "/images/blog/blog-first-time-buyers.jpg",
  "The Heritage of Argentine Polo": "/images/blog/blog-argentine-polo.jpg",
  "Kentucky: Heart of American Horse Country": "/images/blog/blog-kentucky-horse-country.jpg",
  "How to Buy a Horse Safely in 2026": "/images/blog/blog-buy-safely-2026.jpg",
  "Preparing for a Horse Show": "/images/blog/blog-horse-show-prep.jpg",
  "Buying Horses Safely in South Asia": "/images/blog/blog-buy-south-asia.jpg",
  "Training Techniques for Young Riders": "/images/blog/blog-young-riders.jpg",
  "A Guide to Common Hoof Problems": "/images/blog/blog-hoof-problems.jpg",
  "Horse Culture in Azerbaijan": "/images/blog/blog-azerbaijan-culture.jpg",
  "Dressage Training at Grand Prix Level": "/images/blog/blog-dressage-grand-prix.jpg",
  "Equine Nutrition in Hot Climates": "/images/blog/blog-nutrition-hot.jpg",
  "International Horse Transport: Safety First": "/images/blog/blog-horse-transport.jpg",
  "Understanding Equine Lameness": "/images/blog/blog-lameness.jpg",
  "Polo Horse Care Guide": "/images/blog/blog-polo-care.jpg",
  "Tent Pegging Basics for New Enthusiasts": "/images/blog/blog-tent-pegging-basics.jpg",
  "Common Horse Health Warning Signs": "/images/blog/blog-health-warning-signs.jpg",
  "Choosing the Right Saddle for Your Discipline": "/images/blog/blog-saddle-choice.jpg",
  "Feeding Horses in Hot Climates": "/images/blog/blog-feeding-hot.jpg",
  "Building Trust With a New Horse": "/images/blog/blog-building-trust.jpg",
};

function isExternalOrBrokenCover(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const u = url.toLowerCase();
  return u.includes("unsplash.com") || u.includes("picsum.photos");
}

/**
 * Prefer owned local covers for known demo titles when DB still has Unsplash/Picsum.
 * Once `npm run seed:blog-photos` (or the SQL) has run, DB paths win as-is.
 */
export function resolveBlogCover(
  title: string | null | undefined,
  coverImage: string | null | undefined,
): string | null {
  const mapped = title ? COVER_BY_TITLE[title] : undefined;
  if (mapped && isExternalOrBrokenCover(coverImage)) return mapped;
  if (coverImage?.trim()) return coverImage.trim();
  return mapped ?? null;
}
