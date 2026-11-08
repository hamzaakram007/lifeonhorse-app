import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seller & Buyer Policy" };

export default function Page() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Seller & Buyer Policy</h1>
      <p className="text-[var(--color-muted)]">Last updated: June 2026</p>
      <p>Sellers must provide accurate listing information. Buyers should inspect horses before purchase.</p>
      <h2>Contact</h2>
      <p><a href="/support">Contact Support</a> for questions.</p>
    </article>
  );
}
