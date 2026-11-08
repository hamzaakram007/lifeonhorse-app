import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AlertsInbox } from "@/components/dashboard/AlertsInbox";
import { EmptyState } from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { isMissingNotificationsTable } from "@/lib/notifications/query";
import { createClient } from "@/lib/supabase/server";
import type { ActivityNotification } from "@/lib/types/database";

export default async function AlertsPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/alerts");

  const t = await getTranslations("Dashboard");
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
          <h1 className="font-serif text-3xl font-bold">{t("activityAlerts")}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("alertsIntro")}</p>
        </div>
        <Link href="/dashboard/favorites" className="text-sm text-[var(--color-primary)] hover:underline">
          {t("manageFollows")}
        </Link>
      </div>

      {tableMissing ? (
        <EmptyState
          title={t("alertsUnavailable")}
          description={t("alertsUnavailableDesc")}
          action={
            <Link href="/dashboard" className="btn btn-secondary">
              {t("backToDashboard")}
            </Link>
          }
        />
      ) : error ? (
        <EmptyState
          title={t("alertsLoadError")}
          description={error.message}
          action={
            <Link href="/dashboard" className="btn btn-secondary">
              {t("backToDashboard")}
            </Link>
          }
        />
      ) : !items.length ? (
        <EmptyState
          title={t("noAlerts")}
          description={t("noAlertsDesc")}
          action={
            <Link href="/clubs" className="btn btn-primary">
              {t("browseClubs")}
            </Link>
          }
        />
      ) : (
        <AlertsInbox initialItems={items} />
      )}
    </div>
  );
}
