import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery, FeaturedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { normalizeLessons } from "@/lib/courses/lessons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const photos = course.cover_image ? [course.cover_image] : [];
  const categoryLabel = labelFromOptions(COURSE_CATEGORIES, course.category);
  const levelLabel = labelFromOptions(COURSE_LEVELS, course.level);
  const lessons = normalizeLessons(course.lessons);
  const pricing = course.is_free
    ? "Free"
    : course.price != null
      ? `${course.currency ?? "USD"} ${course.price}`
      : "Paid";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Courses", href: "/courses" }, { label: course.title }]} />
      <div className="flex flex-wrap gap-2">
        {course.is_featured ? <FeaturedBadge /> : null}
        {categoryLabel ? <span className="badge">{categoryLabel}</span> : null}
        {levelLabel ? <span className="badge">{levelLabel}</span> : null}
        <span className="badge">{pricing}</span>
      </div>
      <h1 className="font-serif text-3xl font-bold">{course.title}</h1>
      <ListingGallery photos={photos} alt={course.title} />
      {course.description ? (
        <p className="leading-relaxed whitespace-pre-wrap">{course.description}</p>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-semibold">Category</dt>
          <dd>{categoryLabel || "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Level</dt>
          <dd>{levelLabel || "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Pricing</dt>
          <dd>{pricing}</dd>
        </div>
        <div>
          <dt className="font-semibold">Lessons</dt>
          <dd>{lessons.length}</dd>
        </div>
      </dl>

      {lessons.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold">Lesson outline</h2>
          <ol className="space-y-4">
            {lessons.map((lesson, index) => {
              const unlocked = course.is_free || index === 0;
              return (
                <li
                  key={`${index}-${lesson.title}`}
                  className="rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">
                      {index + 1}. {lesson.title}
                    </h3>
                    {!unlocked ? (
                      <span className="text-xs text-[var(--color-muted)]">Locked preview</span>
                    ) : index === 0 && !course.is_free ? (
                      <span className="text-xs text-[var(--color-muted)]">Free preview</span>
                    ) : null}
                  </div>
                  {unlocked ? (
                    <>
                      {lesson.content ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                          {lesson.content}
                        </p>
                      ) : null}
                      {lesson.url ? (
                        <p className="mt-2 text-sm">
                          <a
                            href={lesson.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                          >
                            Open resource
                          </a>
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Full lesson unlocks after enrollment. Checkout arrives in a later release —
                      see Payments for current guidance.
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
