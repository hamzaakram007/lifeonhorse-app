import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-[var(--color-muted)]">{post.category}</p>
      {post.cover_image && <img src={post.cover_image} alt={post.title} className="rounded-lg" />}
      <div className="prose-legal whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}
