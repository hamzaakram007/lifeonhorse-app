import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OwnedList } from "@/components/dashboard/OwnedList";

const roleLinks: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Admin panel" },
    { href: "/admin/reports", label: "Review reports" },
    { href: "/admin/users", label: "Manage users" },
  ],
  seller: [
    { href: "/dashboard/seller", label: "Seller dashboard" },
    { href: "/marketplace/horses/new", label: "List a horse" },
    { href: "/marketplace/products/new", label: "List a product" },
  ],
  club_owner: [
    { href: "/dashboard/club", label: "Club dashboard" },
    { href: "/clubs/register", label: "Register a club" },
    { href: "/events/new", label: "List an event" },
  ],
  trainer: [
    { href: "/dashboard/trainer", label: "Trainer dashboard" },
    { href: "/courses/new", label: "Create a course" },
  ],
  course_creator: [
    { href: "/dashboard/trainer", label: "Courses dashboard" },
    { href: "/courses/new", label: "Create a course" },
  ],
  member: [
    { href: "/dashboard/favorites", label: "Saved listings" },
    { href: "/community/new", label: "Share a story" },
    { href: "/horse-health", label: "Horse health" },
  ],
};

const defaultLinks = [
  { href: "/dashboard/inquiries", label: "Inquiries inbox" },
  { href: "/dashboard/favorites", label: "Saved listings" },
  { href: "/marketplace/horses/new", label: "List a horse" },
];

const sharedLinks = [
  { href: "/dashboard/profile", label: "Edit profile" },
  { href: "/dashboard/inquiries", label: "Inquiries inbox" },
  { href: "/dashboard/favorites", label: "Saved listings" },
  { href: "/dashboard/expert", label: "Expert dashboard" },
];

export default async function DashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard");

  const links = [...(roleLinks[profile.role] ?? defaultLinks), ...sharedLinks];
  const uniqueLinks = links.filter(
    (link, index, arr) => arr.findIndex((l) => l.href === link.href) === index,
  );

  const supabase = await createClient();

  const showSellerLists = ["seller", "admin"].includes(profile.role);
  const showClubLists = ["club_owner", "admin"].includes(profile.role);
  const showTrainerLists = ["trainer", "course_creator", "admin"].includes(profile.role);

  const [{ data: horses }, { data: clubs }, { data: events }, { data: trainer }, { data: courses }] =
    await Promise.all([
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
    ]);

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-[var(--color-bg)] to-white p-8">
        <h1 className="font-serif text-3xl font-bold">
          Welcome back, {profile.full_name ?? profile.email}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Your {profile.role.replace("_", " ")} dashboard — manage what you own below.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {uniqueLinks.map((l) => (
          <Link key={l.href} href={l.href} className="card card-hover p-5 no-underline">
            <span className="font-semibold text-[var(--color-text)]">{l.label}</span>
          </Link>
        ))}
      </div>

      {showSellerLists ? (
        <OwnedList
          title="Your horses"
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
          createLabel="+ New horse"
          emptyDescription="No horse listings yet — open the seller dashboard for products and services too."
        />
      ) : null}

      {showClubLists ? (
        <>
          <OwnedList
            title="Your clubs"
            items={
              clubs?.map((c) => ({
                id: c.id,
                title: c.name,
                status: c.status,
                href: `/clubs/${c.id}`,
              })) ?? []
            }
            createHref="/clubs/register"
            createLabel="+ New club"
          />
          <OwnedList
            title="Your events"
            items={
              events?.map((e) => ({
                id: e.id,
                title: e.title,
                status: e.status,
                href: `/events/${e.id}`,
              })) ?? []
            }
            createHref="/events/new"
            createLabel="+ New event"
          />
        </>
      ) : null}

      {showTrainerLists ? (
        <>
          {trainer ? (
            <section className="card space-y-2 p-4">
              <h3 className="font-semibold">Trainer profile</h3>
              <p className="text-sm">
                <Link href={`/trainers/${trainer.id}`} className="font-medium hover:underline">
                  {trainer.display_name}
                </Link>
                <span className="ml-2 text-[var(--color-muted)]">{trainer.status}</span>
              </p>
              <Link href="/dashboard/trainer" className="text-sm text-[var(--color-primary)] hover:underline">
                Open trainer dashboard
              </Link>
            </section>
          ) : (
            <OwnedList
              title="Trainer profile"
              items={[]}
              createHref="/trainers/new"
              createLabel="Create trainer profile"
              emptyDescription="You do not have a trainer profile yet."
            />
          )}
          <OwnedList
            title="Your courses"
            items={
              courses?.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                href: `/courses/${c.id}`,
              })) ?? []
            }
            createHref="/courses/new"
            createLabel="+ New course"
          />
        </>
      ) : null}
    </div>
  );
}
