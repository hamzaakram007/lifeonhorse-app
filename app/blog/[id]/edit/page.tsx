import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { isBlogComposerEntityType } from "@/lib/blog/linked-entity";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireAuth();
  if (!profile) redirect(`/auth/login?redirect=/blog/${id}/edit`);

  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const isAuthor = post.author_id === profile.id;
  const isAdmin = ["admin", "moderator"].includes(profile.role);
  const linkedType = isBlogComposerEntityType(post.linked_entity_type)
    ? post.linked_entity_type
    : null;
  const linkedId = linkedType && post.linked_entity_id ? (post.linked_entity_id as string) : null;

  let ownsLinked = false;
  if (linkedType && linkedId) {
    if (linkedType === "club") {
      const { data } = await supabase
        .from("clubs")
        .select("id")
        .eq("id", linkedId)
        .eq("owner_id", profile.id)
        .maybeSingle();
      ownsLinked = Boolean(data);
    } else if (linkedType === "trainer") {
      const { data } = await supabase
        .from("trainers")
        .select("id")
        .eq("id", linkedId)
        .eq("user_id", profile.id)
        .maybeSingle();
      ownsLinked = Boolean(data);
    } else if (linkedType === "course") {
      const { data } = await supabase
        .from("courses")
        .select("id")
        .eq("id", linkedId)
        .eq("creator_id", profile.id)
        .maybeSingle();
      ownsLinked = Boolean(data);
    } else if (linkedType === "expert") {
      const { data } = await supabase
        .from("experts")
        .select("id")
        .eq("id", linkedId)
        .eq("user_id", profile.id)
        .maybeSingle();
      ownsLinked = Boolean(data);
    }
  }

  if (!isAuthor && !isAdmin && !ownsLinked) {
    redirect(`/blog/${id}`);
  }

  const heading =
    linkedType === "club"
      ? "Edit club update"
      : linkedType === "trainer"
        ? "Edit trainer tip"
        : linkedType === "course"
          ? "Edit course update"
          : linkedType === "expert"
            ? "Edit health tip"
            : "Edit article";

  return (
    <BlogPostForm
      heading={heading}
      presetClubId={linkedType === "club" ? linkedId : null}
      presetTrainerId={linkedType === "trainer" ? linkedId : null}
      presetCourseId={linkedType === "course" ? linkedId : null}
      presetExpertId={linkedType === "expert" ? linkedId : null}
      initial={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        category: post.category ?? "guides",
        cover_image: post.cover_image,
        linked_entity_type: linkedType,
        linked_entity_id: linkedId,
        status: post.status === "draft" ? "draft" : "published",
      }}
    />
  );
}
