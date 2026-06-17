const fs = require("fs");
const path = require("path");

const legalPages = [
  ["privacy", "Privacy Policy", "We collect account information, listings, inquiries, and usage data to operate LifeOnHorse."],
  ["cookies", "Cookie Policy", "We use essential cookies for authentication and session management."],
  ["marketplace-safety", "Marketplace Safety Policy", "Verify sellers before large transactions. Report suspicious listings."],
  ["health-disclaimer", "Horse Health Disclaimer", "NOT FOR EMERGENCIES. Contact a licensed veterinarian immediately for urgent cases."],
  ["seller-buyer", "Seller & Buyer Policy", "Sellers must provide accurate listing information. Buyers should inspect horses before purchase."],
];

for (const [slug, title, intro] of legalPages) {
  const dir = path.join("app/legal", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "page.tsx"),
    `import type { Metadata } from "next";

export const metadata: Metadata = { title: "${title}" };

export default function Page() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">${title}</h1>
      <p className="text-[var(--color-muted)]">Last updated: June 2026</p>
      <p>${intro}</p>
      <h2>Contact</h2>
      <p><a href="/support">Contact Support</a> for questions.</p>
    </article>
  );
}
`
  );
}

const dirs = [
  "app/auth/login",
  "app/auth/signup",
  "app/auth/callback",
  "app/marketplace/horses/new",
  "app/marketplace/products",
  "app/marketplace/services",
  "app/marketplace/sellers",
  "app/clubs/new",
  "app/trainers/new",
  "app/events/new",
  "app/courses/new",
  "app/blog/new",
  "app/community/new",
  "app/health/request",
  "app/health/experts/new",
  "app/dashboard/inquiries",
  "app/dashboard/seller",
  "app/dashboard/expert",
  "app/dashboard/favorites",
  "app/admin/reports",
  "app/admin/billing",
  "app/admin/analytics",
  "app/countries",
];

dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));
console.log("Scaffold dirs created");
