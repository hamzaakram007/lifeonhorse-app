import { redirect } from "next/navigation";

/** Canonical health moderation lives at /admin/health (001 columns). */
export default function AdminHealthRequestsRedirect() {
  redirect("/admin/health");
}
