import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/ui";

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("community_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <PhotoGallery photos={Array.isArray(post.photos) ? post.photos : []} />
      <p className="whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}
