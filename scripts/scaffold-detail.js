const fs = require("fs");
const path = require("path");

function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(process.cwd(), rel)), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), rel), content);
}

write("app/marketplace/horses/[id]/page.tsx", `import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("horses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Horse Listing" };
}

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: horse } = await supabase.from("horses").select("*").eq("id", id).single();
  if (!horse) notFound();
  const { data: owner } = await supabase.from("profiles").select("id, full_name, email").eq("id", horse.owner_id).single();

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {horse.is_featured && <FeaturedBadge />}
        <h1 className="text-3xl font-bold">{horse.title}</h1>
        <p className="text-[var(--color-muted)]">{[horse.city, getCountryName(horse.country_code)].filter(Boolean).join(", ")}</p>
        <PhotoGallery photos={Array.isArray(horse.photos) ? horse.photos : []} />
        <p>{horse.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="font-semibold">Breed</dt><dd>{horse.breed ?? "—"}</dd></div>
          <div><dt className="font-semibold">Age</dt><dd>{horse.age ?? "—"}</dd></div>
          <div><dt className="font-semibold">Gender</dt><dd>{horse.gender ?? "—"}</dd></div>
          <div><dt className="font-semibold">Price</dt><dd>{horse.price ? \`\${horse.currency} \${horse.price}\` : "On request"}</dd></div>
        </dl>
      </div>
      <div className="space-y-4">
        <FavoriteButton entityType="horse" entityId={horse.id} />
        {owner && <InquiryForm recipientId={owner.id} entityType="horse" entityId={horse.id} />}
      </div>
    </div>
  );
}
`);

write("components/InquiryForm.tsx", `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function InquiryForm({ recipientId, entityType, entityId }: { recipientId: string; entityType: string; entityId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const { error } = await supabase.from("inquiries").insert({ sender_id: user.id, recipient_id: recipientId, entity_type: entityType, entity_id: entityId, message });
    setStatus(error ? "error" : "done");
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h3 className="font-semibold">Send inquiry</h3>
      <textarea className="input min-h-24" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." />
      <button type="submit" className="btn btn-primary w-full" disabled={status === "loading" || status === "done"}>
        {status === "done" ? "Sent!" : status === "loading" ? "Sending..." : "Send inquiry"}
      </button>
      {status === "error" && <p className="text-sm text-[var(--color-danger)]">Failed to send. Try again.</p>}
    </form>
  );
}
`);

write("components/FavoriteButton.tsx", `"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("entity_type", entityType).eq("entity_id", entityId).maybeSingle();
      setSaved(!!data);
      setLoading(false);
    })();
  }, [entityType, entityId]);

  async function toggle() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    if (saved) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("entity_type", entityType).eq("entity_id", entityId);
      setSaved(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, entity_type: entityType, entity_id: entityId });
      setSaved(true);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={loading} className="btn btn-secondary w-full">
      {saved ? "★ Saved" : "☆ Save listing"}
    </button>
  );
}
`);

write("app/dashboard/page.tsx", `import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");

  const links = [
    { href: "/dashboard/inquiries", label: "Inquiries inbox" },
    { href: "/dashboard/favorites", label: "Saved listings" },
    { href: "/dashboard/seller", label: "Seller dashboard" },
    { href: "/dashboard/expert", label: "Expert dashboard" },
    { href: "/marketplace/horses/new", label: "List a horse" },
    { href: "/clubs/new", label: "Register a club" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {profile.full_name ?? profile.email}</h1>
      <p className="text-[var(--color-muted)]">Role: {profile.role}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card p-4 no-underline hover:shadow-md">
            <span className="font-semibold text-[var(--color-text)]">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

write("app/dashboard/inquiries/page.tsx", `import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export default async function InquiriesPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("inquiries").select("*").or(\`sender_id.eq.\${profile.id},recipient_id.eq.\${profile.id}\`).order("created_at", { ascending: false });
  const { data: notifications } = await supabase.from("inquiry_notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inquiries</h1>
      {notifications?.length ? (
        <div className="space-y-2">
          <h2 className="font-semibold">Notifications</h2>
          {notifications.map((n) => (
            <div key={n.id} className={\`card p-3 text-sm \${n.is_read ? "opacity-70" : ""}\`}>
              <p className="font-medium">{n.title}</p>
              <p className="text-[var(--color-muted)]">{n.body}</p>
            </div>
          ))}
        </div>
      ) : null}
      {!inquiries?.length ? <EmptyState title="No inquiries yet" /> : (
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className="card p-4">
              <p className="text-xs text-[var(--color-muted)]">{i.entity_type} · {i.status}</p>
              <p className="mt-1">{i.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

write("app/dashboard/favorites/page.tsx", `import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export default async function FavoritesPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved listings</h1>
      {!data?.length ? <EmptyState title="No saved listings" action={<Link href="/marketplace" className="btn btn-primary">Browse marketplace</Link>} /> : (
        <ul className="space-y-2">
          {data.map((f) => (
            <li key={f.id} className="card p-3">
              <Link href={\`/\${f.entity_type === "horse" ? "marketplace/horses" : f.entity_type}s/\${f.entity_id}\`}>{f.entity_type} — view</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`);

console.log("Detail and dashboard pages created");
