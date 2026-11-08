import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string; expert?: string; category?: string }>;
}) {
  const params = await searchParams;
  const clubId = params.club?.trim() || null;
  const expertId = params.expert?.trim() || null;

  // Expert tips win when both are present — avoid ambiguous dual-link.
  if (expertId) {
    return <BlogPostForm presetExpertId={expertId} />;
  }

  return <BlogPostForm presetClubId={clubId} />;
}
