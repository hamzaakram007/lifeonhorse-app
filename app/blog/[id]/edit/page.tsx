import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireAuth();
  if (!profile) redirect(`/auth/login?redirect=/blog/${id}/edit`);

  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const isAuthor = post.author_id === profile.id;
  const isAdmin = ["admin", "moderator"].includes(profile.role);
  let ownsClub = false;
  if (post.linked_entity_type === "club" && post.linked_entity_id) {
    const { data: club } = await supabase
      .from("clubs")
      .select("id")
      .eq("id", post.linked_entity_id)
      .eq("owner_id", profile.id)
      .maybeSingle();
    ownsClub = Boolean(club);
  }

  if (!isAuthor && !isAdmin && !ownsClub) {
    redirect(`/blog/${id}`);
  }

  const isClubPost = post.linked_entity_type === "club" && Boolean(post.linked_entity_id);

  return (
    <BlogPostForm
      heading={isClubPost ? "Edit club update" : "Edit article"}
      presetClubId={isClubPost ? post.linked_entity_id : null}
      initial={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        category: post.category ?? "guides",
        cover_image: post.cover_image,
        linked_entity_type: isClubPost ? "club" : null,
        linked_entity_id: post.linked_entity_id,
        status: post.status === "draft" ? "draft" : "published",
      }}
    />
  );
}
