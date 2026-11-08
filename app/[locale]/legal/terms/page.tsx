import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-[var(--color-muted)]">Last updated: June 2026</p>
      <p>
        Welcome to LifeOnHorse. By accessing or using our platform, you agree to these Terms of Service.
        LifeOnHorse provides a marketplace and community platform for horse-related listings, services, clubs,
        events, courses, and expert health guidance.
      </p>
      <h2>Account responsibilities</h2>
      <p>
        You must provide accurate information, keep your credentials secure, and notify us of unauthorized access.
        You are responsible for all activity under your account.
      </p>
      <h2>User content</h2>
      <p>
        You retain ownership of content you submit. You grant LifeOnHorse a license to display and promote your
        listings on the platform. You must not post illegal, misleading, or harmful content.
      </p>
      <h2>Marketplace transactions</h2>
      <p>
        LifeOnHorse facilitates connections between buyers and sellers. We are not a party to transactions unless
        explicitly stated. See our Seller/Buyer Policy for details.
      </p>
      <h2>Health services disclaimer</h2>
      <p>
        Health requests and expert responses are informational only and do not replace in-person veterinary care.
        See our Health Disclaimer for full details.
      </p>
      <h2>Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms or our safety policies. You may close your
        account at any time by contacting support.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="/support">Contact Support</a>.
      </p>
    </article>
  );
}
