import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME, NAV_LINKS } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth";
import { SITE_IMAGES } from "@/lib/section-images";
import { isAdminRole } from "@/lib/utils";

export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src={SITE_IMAGES.brandMark}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            priority
          />
          <span className="font-serif text-xl font-bold text-[var(--color-text)]">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-700 hover:text-amber-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {profile ? (
            <>
              {isAdminRole(profile.role) && (
                <Link href="/admin" className="text-sm font-medium text-amber-800">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-sm font-medium text-stone-700">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-stone-600 hover:text-amber-800">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-3 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap text-xs text-stone-600">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
