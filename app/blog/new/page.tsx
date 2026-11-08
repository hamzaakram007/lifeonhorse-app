import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    club?: string;
    trainer?: string;
    course?: string;
    expert?: string;
    event?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const clubId = params.club?.trim() || null;
  const trainerId = params.trainer?.trim() || null;
  const courseId = params.course?.trim() || null;
  const expertId = params.expert?.trim() || null;
  const eventId = params.event?.trim() || null;

  // Prefer the most specific entity when multiple params are present.
  if (expertId) {
    return <BlogPostForm presetExpertId={expertId} />;
  }
  if (eventId) {
    return <BlogPostForm presetEventId={eventId} />;
  }
  if (trainerId) {
    return <BlogPostForm presetTrainerId={trainerId} />;
  }
  if (courseId) {
    return <BlogPostForm presetCourseId={courseId} />;
  }

  return <BlogPostForm presetClubId={clubId} />;
}
