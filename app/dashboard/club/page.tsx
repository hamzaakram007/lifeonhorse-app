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
  const [{ data: clubs }, { data: events }, { data: pendingFeatured }] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Club owner dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage clubs you own and events you host.{" "}
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
          <OwnedList
            title="Your clubs"
            items={clubItems}
            createHref="/clubs/register"
            createLabel="+ New club"
            emptyDescription="You have not registered a club yet."
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
