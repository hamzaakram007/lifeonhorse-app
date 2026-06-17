"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="flex gap-3 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 text-sm lg:hidden" aria-label="Mobile navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap no-underline ${isActive(pathname, link.href) ? "font-semibold text-[var(--color-primary)]" : ""}`}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden flex-wrap gap-x-4 gap-y-1 text-sm font-medium lg:flex" aria-label="Main navigation">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`no-underline hover:text-[var(--color-primary-dark)] ${isActive(pathname, link.href) ? "font-semibold text-[var(--color-primary)]" : ""}`}
          aria-current={isActive(pathname, link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
