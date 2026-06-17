import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

const roleLinks: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Admin panel" },
    { href: "/admin/reports", label: "Review reports" },
    { href: "/admin/users", label: "Manage users" },
  ],
  seller: [
    { href: "/dashboard/seller", label: "Seller dashboard" },
    { href: "/marketplace/horses/new", label: "List a horse" },
    { href: "/marketplace/products/new", label: "List a product" },
  ],
  club_owner: [
    { href: "/clubs/register", label: "Manage club" },
    { href: "/events/new", label: "List an event" },
  ],
  trainer: [
    { href: "/trainers/new", label: "Update trainer profile" },
    { href: "/courses/new", label: "Create a course" },
  ],
  member: [
    { href: "/dashboard/favorites", label: "Saved listings" },
    { href: "/community/new", label: "Share a story" },
    { href: "/health", label: "Horse health" },
  ],
};

const defaultLinks = [
  { href: "/dashboard/inquiries", label: "Inquiries inbox" },
  { href: "/dashboard/favorites", label: "Saved listings" },
  { href: "/marketplace/horses/new", label: "List a horse" },
];

export default async function DashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard");

  const links = roleLinks[profile.role] ?? defaultLinks;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-[var(--color-bg)] to-white p-8">
        <h1 className="font-serif text-3xl font-bold">
          Welcome back, {profile.full_name ?? profile.email}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Your {profile.role.replace("_", " ")} dashboard — quick actions below.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card card-hover p-5 no-underline">
            <span className="font-semibold text-[var(--color-text)]">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
