import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/horses", label: "Horses" },
    { href: "/admin/clubs", label: "Clubs" },
    { href: "/admin/trainers", label: "Trainers" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/commissions", label: "Commissions" },
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
