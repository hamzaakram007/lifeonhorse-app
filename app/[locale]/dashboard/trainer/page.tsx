import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { OwnedList } from "@/components/dashboard/OwnedList";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";
import { FeaturedRequestButton } from "@/components/FeaturedRequestButton";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export default async function TrainerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/trainer");

  const t = await getTranslations("Dashboard");
  const emptyT = await getTranslations("Empty");
  const formsT = await getTranslations("Forms");
  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const [{ data: courses }, { data: pendingFeatured }, tipsResult, courseNotesResult] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, title, status, level, category, is_free, is_featured")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("featured_listing_requests")
        .select("entity_type, entity_id")
        .eq("user_id", profile.id)
        .eq("status", "pending"),
      trainer
        ? supabase
            .from("blog_posts")
            .select("id, title, status, linked_entity_id, published_at")
            .eq("author_id", profile.id)
            .eq("linked_entity_type", "trainer")
            .eq("linked_entity_id", trainer.id)
            .order("updated_at", { ascending: false })
            .limit(12)
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("blog_posts")
        .select("id, title, status, linked_entity_id, published_at")
        .eq("author_id", profile.id)
        .eq("linked_entity_type", "course")
        .order("updated_at", { ascending: false })
        .limit(12),
    ]);

  const tipPosts = isMissingLinkedEntityColumn(tipsResult.error) ? [] : tipsResult.data;
  const courseNotes = isMissingLinkedEntityColumn(courseNotesResult.error)
    ? []
    : courseNotesResult.data;

  const pendingKey = new Set(
    (pendingFeatured ?? []).map((r) => `${r.entity_type}:${r.entity_id}`)
  );

  const courseItems =
    courses?.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      href: `/courses/${c.id}`,
      meta: [c.category, c.level, c.is_free ? "free" : "paid"].filter(Boolean).join(" · ") || null,
      featureEntityType: "course",
      isFeatured: Boolean(c.is_featured),
      featurePending: pendingKey.has(`course:${c.id}`),
    })) ?? [];

  const tipItems =
    tipPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/blog/${p.id}`,
      editHref: `/blog/${p.id}/edit`,
      meta: p.published_at ? new Date(p.published_at).toLocaleDateString() : "Trainer tip",
    })) ?? [];

  const courseNoteItems =
    courseNotes?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/blog/${p.id}`,
      editHref: `/blog/${p.id}/edit`,
      meta: p.published_at ? new Date(p.published_at).toLocaleDateString() : "Course update",
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{t("trainerDashboard")}</h1>
        <p className="text-sm text-[var(--color-muted)]">{t("trainerIntro")}</p>
      </div>

      {trainer ? (
        <>
          <div className="card space-y-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {trainer.is_verified ? <VerifiedBadge /> : null}
              </div>
              <FeaturedRequestButton
                entityType="trainer"
                entityId={trainer.id}
                isFeatured={Boolean(trainer.is_featured)}
                hasPending={pendingKey.has(`trainer:${trainer.id}`)}
              />
            </div>
            <h2 className="text-xl font-semibold">{trainer.display_name}</h2>
            {trainer.specialty ? (
              <p className="text-sm text-[var(--color-muted)]">{trainer.specialty}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/trainers/${trainer.id}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                {t("viewPublicProfile")}
              </Link>
              <Link
                href={`/blog/new?trainer=${trainer.id}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {t("shareTip")}
              </Link>
              <span className="text-[var(--color-muted)]">Status: {trainer.status}</span>
            </div>
          </div>
          <VerificationUpload entityType="trainer" entityId={trainer.id} />
        </>
      ) : (
        <EmptyState
          title={t("noTrainerYet")}
          description={t("noTrainerYetDesc")}
          action={
            <Link href="/trainers/new" className="btn btn-primary">
              {t("createTrainerProfile")}
            </Link>
          }
        />
      )}

      {trainer ? (
        <OwnedList
          title={t("yourTips")}
          items={tipItems}
          createHref={`/blog/new?trainer=${trainer.id}`}
          createLabel={t("newShareTip")}
          emptyDescription={t("emptyTrainerTips")}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">
            {t("yourCourses")} ({courseItems.length})
          </h3>
          <Link href="/courses/new" className="btn btn-primary inline-flex text-sm">
            {t("newCourse")}
          </Link>
        </div>
        {!courseItems.length ? (
          <p className="text-sm text-[var(--color-muted)]">
            You have not created any courses yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {courseItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <Link href={item.href} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-xs text-[var(--color-muted)]">
                    {[item.status, item.meta].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={item.href} className="text-[var(--color-primary)] hover:underline">
                    {formsT("view")}
                  </Link>
                  <Link
                    href={`/blog/new?course=${item.id}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {emptyT("postAboutCourse")}
                  </Link>
                  <FeaturedRequestButton
                    entityType="course"
                    entityId={item.id}
                    isFeatured={item.isFeatured}
                    hasPending={item.featurePending}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {courseItems.length ? (
        <OwnedList
          title={t("yourCourseUpdates")}
          items={courseNoteItems}
          createHref={`/blog/new?course=${courseItems[0].id}`}
          createLabel={`+ ${emptyT("postAboutCourse")}`}
          emptyDescription={t("emptyCourseNotes")}
        />
      ) : null}
    </div>
  );
}
