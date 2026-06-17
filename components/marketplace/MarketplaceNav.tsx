"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MARKETPLACE_TABS } from "@/lib/constants";

export function MarketplaceNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
      {MARKETPLACE_TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            isActive(tab.href, "exact" in tab ? tab.exact : false)
              ? "bg-amber-800 text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
