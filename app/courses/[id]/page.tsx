import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ListingGallery, FeaturedBadge, ListingCard, EmptyState } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { normalizeLessons } from "@/lib/courses/lessons";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const photos = course.cover_image ? [course.cover_image] : [];
  const categoryLabel = labelFromOptions(COURSE_CATEGORIES, course.category);
  const levelLabel = labelFromOptions(COURSE_LEVELS, course.level);
  const lessons = normalizeLessons(course.lessons);
  const isPaid = !course.is_free;
  const pricing = course.is_free
    ? "Free"
    : course.price != null
      ? `${course.currency ?? "USD"} ${course.price}`
      : "Paid";
  const isCreator = Boolean(profile && profile.id === course.creator_id);

  const [notesResult, { data: trainer }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, published_at, excerpt")
      .eq("status", "published")
      .eq("linked_entity_type", "course")
      .eq("linked_entity_id", id)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("trainers")
      .select("id, display_name")
      .eq("user_id", course.creator_id)
      .maybeSingle(),
  ]);
  const notePosts = isMissingLinkedEntityColumn(notesResult.error) ? [] : notesResult.data;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Courses", href: "/courses" }, { label: course.title }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {course.is_featured ? <FeaturedBadge /> : null}
          {categoryLabel ? <span className="badge">{categoryLabel}</span> : null}
          {levelLabel ? <span className="badge">{levelLabel}</span> : null}
          <span className="badge">{isPaid ? "Paid" : "Free"}</span>
          {isPaid && course.price != null ? <span className="badge">{pricing}</span> : null}
        </div>
        {isCreator ? (
          <Link href={`/blog/new?course=${course.id}`} className="btn btn-primary">
            Announce update
          </Link>
        ) : null}
      </div>
      <h1 className="font-serif text-3xl font-bold">{course.title}</h1>
      {trainer ? (
        <p className="text-sm text-[var(--color-muted)]">
          By{" "}
          <Link
            href={`/trainers/${trainer.id}`}
            className="text-[var(--color-primary)] hover:underline"
          >
            {trainer.display_name}
          </Link>
        </p>
      ) : null}
      <ListingGallery photos={photos} alt={course.title} />
      {course.description ? (
        <p className="leading-relaxed whitespace-pre-wrap">{course.description}</p>
      ) : null}

      {isPaid ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-950">Paid course — payments later</p>
          <p className="mt-1 text-amber-900/80">
            Online checkout is not integrated yet. You can preview the first lesson below; full access
            will unlock after enrollment payments ship. Until then, see{" "}
            <Link href="/payments" className="font-medium underline underline-offset-2">
              Payments
            </Link>{" "}
            for manual guidance by country.
          </p>
        </div>
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
          <dt className="font-semibold">Access</dt>
          <dd>{isPaid ? "Paid" : "Free"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Price</dt>
          <dd>{pricing}</dd>
        </div>
        <div>
          <dt className="font-semibold">Lessons</dt>
          <dd>{lessons.length}</dd>
        </div>
      </dl>

      <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-serif text-2xl font-bold">From this course</h2>
          <Link
            href={`/blog?course=${course.id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            View all notes
          </Link>
        </div>
        {!notePosts?.length ? (
          <EmptyState
            title={isCreator ? "No creator notes yet" : "No course updates yet"}
            description={
              isCreator
                ? "You’re the creator — announce a lesson, schedule change, or tip for enrolled riders."
                : "Ask the creator to share course notes and announcements."
            }
            action={
              isCreator ? (
                <Link href={`/blog/new?course=${course.id}`} className="btn btn-primary">
                  Announce update
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="listing-grid">
            {notePosts.map((post) => (
              <ListingCard
                key={post.id}
                href={`/blog/${post.id}`}
                title={post.title}
                subtitle={
                  post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : undefined
                }
                image={resolveBlogCover(post.title, post.cover_image)}
                badges={<span className="badge">Course update</span>}
              />
            ))}
          </div>
        )}
      </section>

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
                      Locked until paid enrollment. Checkout is deferred — see{" "}
                      <Link href="/payments" className="underline underline-offset-2">
                        Payments
                      </Link>{" "}
                      for manual options.
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
