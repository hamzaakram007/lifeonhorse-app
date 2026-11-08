/** PostgREST / Postgres errors when 012_activity_notifications is not applied yet. */
export function isMissingNotificationsTable(
  error: { message?: string; code?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /relation ['"]?public\.?notifications['"]? does not exist/i.test(
    error.message ?? ""
  ) || /Could not find the table ['"]public\.notifications['"]/i.test(error.message ?? "");
}
