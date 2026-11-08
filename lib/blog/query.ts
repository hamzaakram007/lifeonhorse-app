/** PostgREST / Postgres missing-column errors before 008 is applied. */
export function isMissingLinkedEntityColumn(
  error: { message?: string; code?: string } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code === "42703") return true;
  return /linked_entity_(type|id)/i.test(error.message ?? "");
}
