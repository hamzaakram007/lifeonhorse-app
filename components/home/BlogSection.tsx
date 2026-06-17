import Link from "next/link";

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
    cover_image: "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=600&h=400&fit=crop&q=80",
    excerpt: "What to check before you buy.",
  },
  {
    id: "2",
    title: "Training Techniques for Young Riders",
    cover_image: "https://images.unsplash.com/photo-1503876466838-947ae2095810?w=600&h=400&fit=crop&q=80",
    excerpt: "Building confidence in the saddle.",
  },
  {
    id: "3",
    title: "A Guide to Common Hoof Problems",
    cover_image: "https://images.unsplash.com/photo-1509783230216-0b724a2771ec?w=600&h=400&fit=crop&q=80",
    excerpt: "When to call a farrier or vet.",
  },
];

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
                backgroundImage: `url("${post.cover_image ?? "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=400&fit=crop"}")`,
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
