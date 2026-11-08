import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Payments",
  description: "Country-specific payment guidance for LifeOnHorse featured listings and subscriptions.",
};

const paymentGuidance: Record<string, string> = {
  PK: "JazzCash, Easypaisa, bank transfer. Upload payment proof for manual confirmation.",
  IN: "UPI, Razorpay, bank transfer. GST may apply.",
  US: "Stripe cards, PayPal, bank transfer.",
  GB: "Stripe, bank transfer (BACS).",
  AE: "Bank transfer, cards via Stripe where available.",
  ZA: "PayFast, EFT bank transfer.",
  TR: "Bank transfer, cards where supported.",
  DEFAULT: "Contact support for manual payment instructions. Upload proof after bank transfer.",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Automated checkout is not live yet. Featured placements, seller plans, and course enrollments
          are confirmed manually after payment proof.
        </p>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold">For sellers & listing owners</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          <li>
            Request featured placement from your{" "}
            <Link href="/dashboard/seller" className="text-[var(--color-primary)] hover:underline">
              seller
            </Link>
            ,{" "}
            <Link href="/dashboard/club" className="text-[var(--color-primary)] hover:underline">
              club
            </Link>
            , or{" "}
            <Link href="/dashboard/trainer" className="text-[var(--color-primary)] hover:underline">
              trainer
            </Link>{" "}
            dashboard — admins approve and set the featured flag.
          </li>
          <li>
            Marketplace deals may include a platform commission (typically ~5%). Admins record these
            manually; you will be contacted with transfer instructions when a deal closes.
          </li>
          <li>
            Paid courses show price and lock non-preview lessons until enrollment checkout ships. See
            the course page for current “payments later” messaging.
          </li>
        </ul>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold">Available plans</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Featured horse listing — from $29 / 30 days</li>
          <li>Premium seller subscription — from $19 / month</li>
          <li>Club premium — from $39 / month</li>
          <li>Expert premium — from $49 / month</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn btn-primary inline-flex">
            Go to dashboard
          </Link>
          <Link href="/dashboard/seller" className="btn btn-secondary inline-flex">
            Seller listings
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Country payment guidance</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {COUNTRIES.slice(0, 20).map((c) => (
            <div key={c.code} className="card p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {paymentGuidance[c.code] ?? paymentGuidance.DEFAULT}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
