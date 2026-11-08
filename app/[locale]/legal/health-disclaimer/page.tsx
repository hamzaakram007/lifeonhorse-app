import type { Metadata } from "next";

export const metadata: Metadata = { title: "Horse Health Disclaimer" };

export default function Page() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Horse Health Disclaimer</h1>
      <p className="text-[var(--color-muted)]">Last updated: June 2026</p>
      <p>NOT FOR EMERGENCIES. Contact a licensed veterinarian immediately for urgent cases.</p>
      <h2>Contact</h2>
      <p><a href="/support">Contact Support</a> for questions.</p>
    </article>
  );
}
