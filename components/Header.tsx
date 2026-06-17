import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/HeaderNav";

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
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-serif text-xl font-bold text-[var(--color-primary)] no-underline" aria-label="LifeOnHorse home">
          LifeOnHorse
        </Link>
        <HeaderNav variant="desktop" />
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary px-3 py-2 text-sm">
                {profile?.full_name ?? "Dashboard"}
              </Link>
              {["admin", "moderator"].includes(profile?.role ?? "") && (
                <Link href="/admin" className="btn btn-primary px-3 py-2 text-sm">
                  Admin
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-secondary px-3 py-2 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary px-3 py-2 text-sm">
                Log in
              </Link>
              <Link href="/auth/signup" className="btn btn-primary px-3 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <HeaderNav variant="mobile" />
    </header>
  );
}
