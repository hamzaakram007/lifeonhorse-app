import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Contact LifeOnHorse support for help with listings, accounts, and safety.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Support & Contact</h1>
      <p className="text-[var(--color-muted)]">
        Need help with your account, a listing, verification, or a safety concern? We are here to help.
      </p>
      <div className="card space-y-4 p-6">
        <div>
          <h2 className="font-semibold">General support</h2>
          <p className="text-sm">Email: support@lifeonhorse.com</p>
        </div>
        <div>
          <h2 className="font-semibold">Safety & moderation</h2>
          <p className="text-sm">Report content using the Report button on any listing, or contact support with details.</p>
        </div>
        <div>
          <h2 className="font-semibold">Health emergencies</h2>
          <p className="text-sm text-[var(--color-danger)] font-medium">
            LifeOnHorse is NOT for emergencies. Contact a licensed veterinarian immediately for urgent cases.
          </p>
          <Link href="/legal/health-disclaimer" className="text-sm">Read full health disclaimer →</Link>
        </div>
        <div>
          <h2 className="font-semibold">Billing & featured listings</h2>
          <p className="text-sm">See our <Link href="/payments">Payments page</Link> for country-specific payment guidance.</p>
        </div>
      </div>
    </div>
  );
}
