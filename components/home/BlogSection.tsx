import Link from "next/link";
import { SITE_IMAGES } from "@/lib/section-images";

type BlogPost = {
  id: string;
  title: string;
  cover_image: string | null;
  excerpt: string | null;
};

const FALLBACK_POSTS = [
  {
    id: "1",
    title: "Essential Tips for First-Time Horse Buyers",
    cover_image: SITE_IMAGES.blog.buyers,
    excerpt: "What to check before you buy.",
  },
  {
    id: "2",
    title: "Training Techniques for Young Riders",
    cover_image: SITE_IMAGES.blog.training,
    excerpt: "Building confidence in the saddle.",
  },
  {
    id: "3",
    title: "A Guide to Common Hoof Problems",
    cover_image: SITE_IMAGES.blog.hoof,
    excerpt: "When to call a farrier or vet.",
  },
];

const FALLBACK_COVER = SITE_IMAGES.home.hero;

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  const items = posts.length > 0 ? posts.slice(0, 3) : FALLBACK_POSTS;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">From the Blog</h2>
        <Link href="/blog" className="text-sm font-semibold text-[var(--color-primary)] no-underline hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="group block no-underline"
          >
            <div
              className="aspect-[3/2] overflow-hidden rounded-xl bg-stone-100 bg-cover bg-center transition group-hover:opacity-95"
              style={{
                backgroundImage: `url("${post.cover_image ?? FALLBACK_COVER}")`,
              }}
            />
            <h3 className="mt-4 font-serif text-lg font-bold text-stone-900 group-hover:text-[var(--color-primary)]">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-stone-500">{post.excerpt}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
