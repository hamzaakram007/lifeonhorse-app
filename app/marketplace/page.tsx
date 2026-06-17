import Link from "next/link";

const tabs = [
  { href: "/marketplace/horses", label: "Horses", desc: "Buy, sell, adopt" },
  { href: "/marketplace/products", label: "Products", desc: "Tack & gear" },
  { href: "/marketplace/services", label: "Services", desc: "Professional services" },
  { href: "/marketplace/sellers", label: "Sellers", desc: "Seller directory" },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="card p-6 no-underline hover:shadow-md">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">{t.label}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
