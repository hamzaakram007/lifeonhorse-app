import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertsInbox } from "@/components/dashboard/AlertsInbox";
import { EmptyState } from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { isMissingNotificationsTable } from "@/lib/notifications/query";
import { createClient } from "@/lib/supabase/server";
import type { ActivityNotification } from "@/lib/types/database";

export default async function AlertsPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/alerts");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, user_id, kind, title, body, href, entity_type, entity_id, blog_post_id, is_read, created_at"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const tableMissing = isMissingNotificationsTable(error);
  const items = (data ?? []) as ActivityNotification[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Alerts</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Activity from clubs, trainers, events, and courses you follow. In-app only — no email
            or push.
          </p>
        </div>
        <Link href="/dashboard/favorites" className="text-sm text-[var(--color-primary)] hover:underline">
          Manage follows / saved
        </Link>
      </div>

      {tableMissing ? (
        <EmptyState
          title="Alerts not available yet"
          description="The notifications migration (012) has not been applied on this environment. Once it is live, favorited entity Journal posts will appear here."
          action={
            <Link href="/dashboard" className="btn btn-secondary">
              Back to dashboard
            </Link>
          }
        />
      ) : error ? (
        <EmptyState
          title="Could not load alerts"
          description={error.message}
          action={
            <Link href="/dashboard" className="btn btn-secondary">
              Back to dashboard
            </Link>
          }
        />
      ) : !items.length ? (
        <EmptyState
          title="No alerts yet"
          description="Follow a club, trainer, event, or course. When they publish a Journal update linked to that entity, you will see it here."
          action={
            <Link href="/clubs" className="btn btn-primary">
              Browse clubs
            </Link>
          }
        />
      ) : (
        <AlertsInbox initialItems={items} />
      )}
    </div>
  );
}
