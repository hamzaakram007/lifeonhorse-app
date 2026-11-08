import Link from "next/link";

/** Shown on Journal posts linked to an expert and/or filed under Health. */
export function HealthDisclaimerBlock() {
  return (
    <aside
      className="mt-10 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950"
      role="note"
    >
      <strong>Not a veterinary diagnosis.</strong> This tip is educational guidance only and does
      not replace an in-person exam by a licensed veterinarian. For emergencies, contact a local
      vet immediately.{" "}
      <Link href="/legal/health-disclaimer" className="underline">
        Full health disclaimer
      </Link>
    </aside>
  );
}
