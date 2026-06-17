import Link from "next/link";

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/marketplace-safety", label: "Marketplace Safety" },
  { href: "/legal/health-disclaimer", label: "Health Disclaimer" },
  { href: "/legal/seller-buyer", label: "Seller/Buyer Policy" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-[var(--color-primary)]">LifeOnHorse</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Global horse marketplace, clubs, trainers, health experts, and community.
          </p>
        </div>
        <div>
          <p className="font-semibold">Explore</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/health">Horse Health</Link></li>
            <li><Link href="/payments">Payments</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Legal</p>
          <ul className="mt-2 space-y-1 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-sm text-[var(--color-muted)]">
        © {new Date().getFullYear()} LifeOnHorse. All rights reserved.
      </div>
    </footer>
  );
}
