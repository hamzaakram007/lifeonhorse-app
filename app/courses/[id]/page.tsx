import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, FeaturedBadge } from "@/components/ui";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();
  const photos = course.cover_image ? [course.cover_image] : [];

  return (
    <div className="space-y-6">
      {course.is_featured && <FeaturedBadge />}
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="text-[var(--color-muted)]">{course.category} · {course.is_free ? "Free" : `${course.currency} ${course.price}`}</p>
      <PhotoGallery photos={photos} />
      <p>{course.description}</p>
    </div>
  );
}
