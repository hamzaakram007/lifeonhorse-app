import Link from "next/link";

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/marketplace-safety", label: "Marketplace Safety" },
  { href: "/legal/health-disclaimer", label: "Health Disclaimer" },
  { href: "/legal/seller-buyer", label: "Seller/Buyer Policy" },
];

const trustSignals = [
  { value: "120+", label: "Countries" },
  { value: "10K+", label: "Verified listings" },
  { value: "Secure", label: "Payments" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 py-6 sm:justify-between">
          {trustSignals.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-serif text-2xl font-bold text-[var(--color-primary)]">{s.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-bold text-[var(--color-primary)]">LifeOnHorse</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
            The world&apos;s premier platform for horse marketplace, elite clubs, expert trainers, and equestrian community.
          </p>
          <form className="mt-4 flex max-w-sm gap-2" action="/api/newsletter" method="post">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              className="input flex-1 text-sm"
              aria-label="Newsletter email"
            />
            <button type="submit" className="btn btn-primary text-sm">
              Subscribe
            </button>
          </form>
        </div>
        <div>
          <p className="font-semibold">Explore</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/clubs">Clubs</Link></li>
            <li><Link href="/trainers">Trainers</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/horse-health">Horse Health</Link></li>
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
