import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth";
import { isMissingNotificationsTable } from "@/lib/notifications/query";
import { createClient } from "@/lib/supabase/server";
import { OwnedList } from "@/components/dashboard/OwnedList";

export default async function DashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard");

  const t = await getTranslations("Dashboard");
  const roleLinks: Record<string, { href: string; label: string }[]> = {
    admin: [
      { href: "/admin", label: t("adminPanel") },
      { href: "/admin/reports", label: t("reviewReports") },
      { href: "/admin/users", label: t("manageUsers") },
    ],
    seller: [
      { href: "/dashboard/seller", label: t("sellerDashboard") },
      { href: "/marketplace/horses/new", label: t("listAHorse") },
      { href: "/marketplace/products/new", label: t("listAProduct") },
    ],
    club_owner: [
      { href: "/dashboard/club", label: t("clubDashboard") },
      { href: "/clubs/register", label: t("registerAClub") },
      { href: "/events/new", label: t("listAnEvent") },
    ],
    trainer: [
      { href: "/dashboard/trainer", label: t("trainerDashboard") },
      { href: "/courses/new", label: t("createACourse") },
    ],
    course_creator: [
      { href: "/dashboard/trainer", label: t("coursesDashboard") },
      { href: "/courses/new", label: t("createACourse") },
    ],
    member: [
      { href: "/dashboard/favorites", label: t("savedListings") },
      { href: "/community/new", label: t("shareAStory") },
      { href: "/horse-health", label: t("horseHealth") },
    ],
  };

  const defaultLinks = [
    { href: "/dashboard/inquiries", label: t("inquiriesInbox") },
    { href: "/dashboard/favorites", label: t("savedListings") },
    { href: "/marketplace/horses/new", label: t("listAHorse") },
  ];

  const sharedLinks = [
    { href: "/dashboard/alerts", label: t("activityAlerts") },
    { href: "/dashboard/profile", label: t("editProfile") },
    { href: "/dashboard/inquiries", label: t("inquiriesInbox") },
    { href: "/dashboard/favorites", label: t("savedListings") },
    { href: "/dashboard/expert", label: t("expertDashboard") },
  ];

  const links = [...(roleLinks[profile.role] ?? defaultLinks), ...sharedLinks];
  const uniqueLinks = links.filter(
    (link, index, arr) => arr.findIndex((l) => l.href === link.href) === index,
  );

  const supabase = await createClient();

  const showSellerLists = ["seller", "admin"].includes(profile.role);
  const showClubLists = ["club_owner", "admin"].includes(profile.role);
  const showTrainerLists = ["trainer", "course_creator", "admin"].includes(profile.role);

  const [
    { data: horses },
    { data: clubs },
    { data: events },
    { data: trainer },
    { data: courses },
    unreadResult,
  ] = await Promise.all([
      showSellerLists
        ? supabase
            .from("horses")
            .select("id, title, status")
            .eq("owner_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] as { id: string; title: string; status: string }[] }),
      showClubLists
        ? supabase
            .from("clubs")
            .select("id, name, status")
            .eq("owner_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] as { id: string; name: string; status: string }[] }),
      showClubLists
        ? supabase
            .from("events")
            .select("id, title, status")
            .eq("host_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] as { id: string; title: string; status: string }[] }),
      showTrainerLists
        ? supabase.from("trainers").select("id, display_name, status").eq("user_id", profile.id).maybeSingle()
        : Promise.resolve({ data: null as { id: string; display_name: string; status: string } | null }),
      showTrainerLists
        ? supabase
            .from("courses")
            .select("id, title, status")
            .eq("creator_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] as { id: string; title: string; status: string }[] }),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("is_read", false),
    ]);

  const unreadCount =
    !isMissingNotificationsTable(unreadResult.error) && typeof unreadResult.count === "number"
      ? unreadResult.count
      : 0;

  const roleLabel = profile.role.replace("_", " ");
  const unreadLabel =
    unreadCount === 1
      ? t("unreadAlerts", { count: unreadCount })
      : t("unreadAlertsPlural", { count: unreadCount });

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-[var(--color-bg)] to-white p-8">
        <h1 className="font-serif text-3xl font-bold">
          {t("welcomeBack", { name: profile.full_name ?? profile.email })}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {t("roleDashboard", { role: roleLabel })}
        </p>
        {unreadCount > 0 ? (
          <p className="mt-3 text-sm">
            <Link href="/dashboard/alerts" className="font-medium text-[var(--color-primary)] hover:underline">
              {unreadLabel}
            </Link>
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {uniqueLinks.map((l) => (
          <Link key={l.href} href={l.href} className="card card-hover p-5 no-underline">
            <span className="font-semibold text-[var(--color-text)]">
              {l.label}
              {l.href === "/dashboard/alerts" && unreadCount > 0 ? (
                <span className="ml-2 text-sm font-normal text-[var(--color-primary)]">
                  ({unreadCount})
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>

      {showSellerLists ? (
        <OwnedList
          title={t("yourHorses")}
          items={
            horses?.map((h) => ({
              id: h.id,
              title: h.title,
              status: h.status,
              href: `/marketplace/horses/${h.id}`,
              editHref: `/marketplace/horses/${h.id}/edit`,
            })) ?? []
          }
          createHref="/marketplace/horses/new"
          createLabel={t("newHorse")}
          emptyDescription={t("emptyHorses")}
        />
      ) : null}

      {showClubLists ? (
        <>
          <OwnedList
            title={t("yourClubs")}
            items={
              clubs?.map((c) => ({
                id: c.id,
                title: c.name,
                status: c.status,
                href: `/clubs/${c.id}`,
              })) ?? []
            }
            createHref="/clubs/register"
            createLabel={t("newClub")}
          />
          <OwnedList
            title={t("yourEvents")}
            items={
              events?.map((e) => ({
                id: e.id,
                title: e.title,
                status: e.status,
                href: `/events/${e.id}`,
                actionHref: `/blog/new?event=${e.id}`,
                actionLabel: t("eventUpdate"),
              })) ?? []
            }
            createHref="/events/new"
            createLabel={t("newEvent")}
          />
        </>
      ) : null}

      {showTrainerLists ? (
        <>
          {trainer ? (
            <section className="card space-y-2 p-4">
              <h3 className="font-semibold">{t("trainerProfile")}</h3>
              <p className="text-sm">
                <Link href={`/trainers/${trainer.id}`} className="font-medium hover:underline">
                  {trainer.display_name}
                </Link>
                <span className="ml-2 text-[var(--color-muted)]">{trainer.status}</span>
              </p>
              <Link href="/dashboard/trainer" className="text-sm text-[var(--color-primary)] hover:underline">
                {t("openTrainerDashboard")}
              </Link>
            </section>
          ) : (
            <OwnedList
              title={t("trainerProfile")}
              items={[]}
              createHref="/trainers/new"
              createLabel={t("createTrainerProfile")}
              emptyDescription={t("emptyTrainerProfile")}
            />
          )}
          <OwnedList
            title={t("yourCourses")}
            items={
              courses?.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                href: `/courses/${c.id}`,
              })) ?? []
            }
            createHref="/courses/new"
            createLabel={t("newCourse")}
          />
        </>
      ) : null}
    </div>
  );
}
