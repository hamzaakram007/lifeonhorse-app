import { getTranslations } from "next-intl/server";
import { signOutAction } from "@/app/actions/sign-out";
import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/HeaderNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

export async function Header() {
  const t = await getTranslations("Auth");
  const tNav = await getTranslations("Nav");
  const tBrand = await getTranslations("Brand");
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
        {tNav("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[var(--color-primary)] no-underline"
          aria-label={tNav("homeAria")}
        >
          {tBrand("name")}
        </Link>
        <HeaderNav variant="desktop" />
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary px-3 py-2 text-sm">
                {profile?.full_name ?? t("dashboard")}
              </Link>
              {["admin", "moderator"].includes(profile?.role ?? "") && (
                <Link href="/admin" className="btn btn-primary px-3 py-2 text-sm">
                  {t("admin")}
                </Link>
              )}
              <form action={signOutAction}>
                <button type="submit" className="btn btn-secondary px-3 py-2 text-sm">
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary px-3 py-2 text-sm">
                {t("logIn")}
              </Link>
              <Link href="/auth/signup" className="btn btn-primary px-3 py-2 text-sm">
                {t("signUp")}
              </Link>
            </>
          )}
        </div>
      </div>
      <HeaderNav variant="mobile" />
    </header>
  );
}
