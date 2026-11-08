import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { OwnedList } from "@/components/dashboard/OwnedList";
import { EmptyState } from "@/components/ui";

export default async function ClubOwnerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/club");

  const supabase = await createClient();
  const [{ data: clubs }, { data: events }, { data: pendingFeatured }, { data: drafts }] =
    await Promise.all([
      supabase
        .from("clubs")
        .select("id, name, status, city, country_code, is_verified, is_featured")
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("id, title, status, start_date, city, is_featured")
        .eq("host_id", profile.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("featured_listing_requests")
        .select("entity_type, entity_id")
        .eq("user_id", profile.id)
        .eq("status", "pending"),
      supabase
        .from("blog_posts")
        .select("id, title, status, linked_entity_id, published_at")
        .eq("author_id", profile.id)
        .eq("linked_entity_type", "club")
        .order("updated_at", { ascending: false })
        .limit(12),
    ]);

  const pendingKey = new Set(
    (pendingFeatured ?? []).map((r) => `${r.entity_type}:${r.entity_id}`)
  );

  const clubItems =
    clubs?.map((c) => ({
      id: c.id,
      title: c.name,
      status: c.status,
      href: `/clubs/${c.id}`,
      meta:
        [c.city, c.country_code, c.is_verified ? "verified" : null, c.is_featured ? "featured" : null]
          .filter(Boolean)
          .join(" · ") || null,
      featureEntityType: "club",
      isFeatured: Boolean(c.is_featured),
      featurePending: pendingKey.has(`club:${c.id}`),
    })) ?? [];

  const eventItems =
    events?.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      href: `/events/${e.id}`,
      meta: [e.city, e.start_date ? new Date(e.start_date).toLocaleDateString() : null]
        .filter(Boolean)
        .join(" · ") || null,
      featureEntityType: "event",
      isFeatured: Boolean(e.is_featured),
      featurePending: pendingKey.has(`event:${e.id}`),
    })) ?? [];

  const updateItems =
    drafts?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/blog/${p.id}`,
      editHref: `/blog/${p.id}/edit`,
      meta: p.published_at
        ? new Date(p.published_at).toLocaleDateString()
        : "Club update",
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Club owner dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage clubs you own, publish Journal updates, and host events.{" "}
          <Link href="/payments" className="text-[var(--color-primary)] hover:underline">
            Featured listing pricing
          </Link>
        </p>
      </div>

      {!clubItems.length && !eventItems.length ? (
        <EmptyState
          title="No clubs or events yet"
          description="Register a club or list an event to get started."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/clubs/register" className="btn btn-primary">
                Register a club
              </Link>
              <Link href="/events/new" className="btn btn-secondary">
                List an event
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Your clubs ({clubItems.length})</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/clubs/register" className="btn btn-secondary inline-flex text-sm">
                  + New club
                </Link>
                {clubItems[0] ? (
                  <Link
                    href={`/blog/new?club=${clubItems[0].id}`}
                    className="btn btn-primary inline-flex text-sm"
                  >
                    Write club update
                  </Link>
                ) : null}
              </div>
            </div>
            {!clubItems.length ? (
              <p className="text-sm text-[var(--color-muted)]">
                You have not registered a club yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {clubItems.map((item) => (
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
                        View
                      </Link>
                      <Link
                        href={`/blog/new?club=${item.id}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        Write club update
                      </Link>
                      <Link
                        href={`/events/new`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        List event
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <OwnedList
            title="Your club updates"
            items={updateItems}
            createHref={clubItems[0] ? `/blog/new?club=${clubItems[0].id}` : "/blog/new"}
            createLabel="+ Write club update"
            emptyDescription="No Journal updates linked to your clubs yet."
          />

          <OwnedList
            title="Your events"
            items={eventItems}
            createHref="/events/new"
            createLabel="+ New event"
            emptyDescription="No hosted events yet."
          />
        </>
      )}
    </div>
  );
}
