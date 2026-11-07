/** Escape `%` / `_` so user input is treated literally in PostgREST `ilike`. */
export function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
