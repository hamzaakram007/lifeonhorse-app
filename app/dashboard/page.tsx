import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");

  const links = [
    { href: "/dashboard/inquiries", label: "Inquiries inbox" },
    { href: "/dashboard/favorites", label: "Saved listings" },
    { href: "/dashboard/seller", label: "Seller dashboard" },
    { href: "/dashboard/expert", label: "Expert dashboard" },
    { href: "/marketplace/horses/new", label: "List a horse" },
    { href: "/clubs/new", label: "Register a club" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {profile.full_name ?? profile.email}</h1>
      <p className="text-[var(--color-muted)]">Role: {profile.role}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card p-4 no-underline hover:shadow-md">
            <span className="font-semibold text-[var(--color-text)]">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
