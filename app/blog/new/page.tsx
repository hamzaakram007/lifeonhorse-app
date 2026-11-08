import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string }>;
}) {
  const params = await searchParams;
  const clubId = params.club?.trim() || null;

  return <BlogPostForm presetClubId={clubId} />;
}
