import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/health", label: "Horse Health" },
  { href: "/clubs", label: "Clubs" },
  { href: "/trainers", label: "Trainers" },
  { href: "/events", label: "Events" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-[var(--color-primary)] no-underline">
          LifeOnHorse
        </Link>
        <nav className="hidden flex-wrap gap-x-4 gap-y-1 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-[var(--color-primary-dark)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary text-sm py-2 px-3">
                {profile?.full_name ?? "Dashboard"}
              </Link>
              {["admin", "moderator"].includes(profile?.role ?? "") && (
                <Link href="/admin" className="btn btn-primary text-sm py-2 px-3">
                  Admin
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-secondary text-sm py-2 px-3">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary text-sm py-2 px-3">
                Log in
              </Link>
              <Link href="/auth/signup" className="btn btn-primary text-sm py-2 px-3">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-3 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 text-sm lg:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap no-underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
