import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login?redirect=/admin");

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/horses", label: "Horses" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/sellers", label: "Sellers" },
    { href: "/admin/clubs", label: "Clubs" },
    { href: "/admin/trainers", label: "Trainers" },
    { href: "/admin/experts", label: "Experts" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/community", label: "Community" },
    { href: "/admin/health", label: "Health requests" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/featured", label: "Featured requests" },
    { href: "/admin/commissions", label: "Commissions" },
    { href: "/admin/billing", label: "Billing" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="w-48 shrink-0">
        <p className="mb-4 font-bold text-amber-900">Admin</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded px-2 py-1 text-sm hover:bg-amber-50">
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
