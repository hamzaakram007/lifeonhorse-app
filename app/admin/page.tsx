import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");

  const supabase = await createClient();
  const { data: analytics } = await supabase.from("analytics_counts").select("*").single();
  const { count: pendingReports } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

  const cards = [
    { label: "Users", value: analytics?.total_users ?? 0 },
    { label: "Horses", value: analytics?.horse_listings ?? 0 },
    { label: "Clubs", value: analytics?.clubs ?? 0 },
    { label: "Experts", value: analytics?.experts ?? 0 },
    { label: "Health requests", value: analytics?.health_requests ?? 0 },
    { label: "Pending reports", value: pendingReports ?? 0 },
  ];

  const links = [
    { href: "/admin/reports", label: "Reports queue" },
    { href: "/admin/health", label: "Health requests" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/sellers", label: "Sellers" },
    { href: "/admin/experts", label: "Experts" },
    { href: "/admin/billing", label: "Billing & orders" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4"><p className="text-sm text-[var(--color-muted)]">{c.label}</p><p className="text-3xl font-bold">{c.value}</p></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => <Link key={l.href} href={l.href} className="card p-4 font-semibold no-underline hover:shadow-md">{l.label}</Link>)}
      </div>
    </div>
  );
}
