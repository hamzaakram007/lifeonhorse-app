import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string; trainer?: string; course?: string }>;
}) {
  const params = await searchParams;
  const clubId = params.club?.trim() || null;
  const trainerId = params.trainer?.trim() || null;
  const courseId = params.course?.trim() || null;

  return (
    <BlogPostForm
      presetClubId={clubId}
      presetTrainerId={trainerId}
      presetCourseId={courseId}
    />
  );
}
