import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-[var(--color-muted)]">Last updated: June 2026</p>
      <p>We collect account information, listings, inquiries, and usage data to operate LifeOnHorse.</p>
      <h2>Contact</h2>
      <p><a href="/support">Contact Support</a> for questions.</p>
    </article>
  );
}
