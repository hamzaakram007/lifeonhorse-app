const fs = require("fs");
const path = require("path");

function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(process.cwd(), rel)), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), rel), content);
}

write("app/dashboard/seller/page.tsx", `import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function SellerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: seller } = await supabase.from("seller_profiles").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: horses } = seller ? await supabase.from("horses").select("id, title, status, is_featured").eq("owner_id", profile.id) : { data: [] };
  const { data: products } = seller ? await supabase.from("products").select("id, title, status").eq("seller_id", seller.id) : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      {seller ? (
        <>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">{seller.is_verified && <VerifiedBadge />}</div>
            <h2 className="text-xl font-semibold">{seller.business_name}</h2>
            <p className="text-sm text-[var(--color-muted)]">{seller.description}</p>
          </div>
          <VerificationUpload entityType="seller" entityId={seller.id} />
          <section>
            <h3 className="font-semibold">Your horses ({horses?.length ?? 0})</h3>
            <Link href="/marketplace/horses/new" className="btn btn-primary mt-2 inline-flex">+ New horse</Link>
          </section>
          <section>
            <h3 className="font-semibold">Products ({products?.length ?? 0})</h3>
          </section>
        </>
      ) : (
        <div className="card p-6">
          <p>Create your seller profile to start listing.</p>
          <Link href="/dashboard/seller/setup" className="btn btn-primary mt-4 inline-flex">Set up seller profile</Link>
        </div>
      )}
    </div>
  );
}
`);

write("app/dashboard/seller/setup/page.tsx", `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";

export default function SellerSetupPage() {
  const [form, setForm] = useState({ business_name: "", description: "", country_code: "PK", city: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from("seller_profiles").insert({ ...form, user_id: user.id });
    setError(err?.message ?? "");
    if (!err) window.location.href = "/dashboard/seller";
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Seller profile setup</h1>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Business name</label><input className="input" required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
      <div><label className="label">Description</label><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">Country</label><select className="input" value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
      <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Create profile"}</button>
    </form>
  );
}
`);

write("app/dashboard/expert/page.tsx", `import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";

export default async function ExpertDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: expert } = await supabase.from("experts").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: requests } = expert ? await supabase.from("health_requests").select("id, horse_name, urgency, status, created_at").eq("expert_id", expert.id).order("created_at", { ascending: false }).limit(10) : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expert Dashboard</h1>
      {expert ? (
        <>
          <div className="card p-4">{expert.is_verified && <VerifiedBadge />}<h2 className="text-xl font-semibold">{expert.display_name}</h2><p>{expert.specialty}</p></div>
          <VerificationUpload entityType="expert" entityId={expert.id} />
          <section><h3 className="font-semibold">Assigned requests</h3>{requests?.map((r) => <div key={r.id} className="card mt-2 p-3 text-sm">{r.horse_name ?? "Horse"} — {r.urgency} — {r.status}</div>)}</section>
        </>
      ) : (
        <div className="card p-6"><p>Register as a health expert to receive requests.</p><Link href="/health/experts/new" className="btn btn-primary mt-4 inline-flex">Register</Link></div>
      )}
    </div>
  );
}
`);

write("components/VerificationUpload.tsx", `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function VerificationUpload({ entityType, entityId }: { entityType: string; entityId: string }) {
  const [status, setStatus] = useState<string>("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = \`\${user.id}/verification/\${Date.now()}-\${file.name}\`;
    const { error: upErr } = await supabase.storage.from("uploads").upload(path, file);
    if (upErr) { setStatus("Upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
    const { error } = await supabase.from("verification_documents").insert({ user_id: user.id, entity_type: entityType, entity_id: entityId, document_url: publicUrl, document_type: file.type });
    setStatus(error ? "Save failed" : "Document submitted for review");
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold">Verification documents</h3>
      <p className="text-sm text-[var(--color-muted)]">Upload business license or credentials for verified badge.</p>
      <input type="file" accept="image/*,.pdf" className="mt-2 text-sm" onChange={upload} />
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}
`);

write("app/admin/page.tsx", `import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");

  const supabase = await createClient();
  const { data: analytics } = await supabase.from("analytics_counts").select("*").single();
  const { count: pendingReports } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

  const cards = [
    { label: "Users", value: analytics?.total_users ?? 0 },
    { label: "Horses", value: analytics?.horse_listings ?? 0 },
    { label: "Clubs", value: analytics?.clubs ?? 0 },
    { label: "Experts", value: analytics?.experts ?? 0 },
    { label: "Health requests", value: analytics?.health_requests ?? 0 },
    { label: "Pending reports", value: pendingReports ?? 0 },
  ];

  const links = [
    { href: "/admin/reports", label: "Reports queue" },
    { href: "/admin/billing", label: "Billing & orders" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/health", label: "Health requests" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4"><p className="text-sm text-[var(--color-muted)]">{c.label}</p><p className="text-3xl font-bold">{c.value}</p></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => <Link key={l.href} href={l.href} className="card p-4 font-semibold no-underline hover:shadow-md">{l.label}</Link>)}
      </div>
    </div>
  );
}
`);

write("app/admin/reports/page.tsx", `import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportActions } from "@/components/admin/ReportActions";
import { EmptyState } from "@/components/ui";

export default async function AdminReportsPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports Queue</h1>
      {!reports?.length ? <EmptyState title="No reports" /> : reports.map((r) => (
        <div key={r.id} className="card p-4">
          <p className="text-xs text-[var(--color-muted)]">{r.entity_type} · {r.status}</p>
          <p className="font-medium">{r.reason}</p>
          <p className="text-sm">{r.details}</p>
          <ReportActions reportId={r.id} entityType={r.entity_type} entityId={r.entity_id} />
        </div>
      ))}
    </div>
  );
}
`);

write("components/admin/ReportActions.tsx", `"use client";

import { createClient } from "@/lib/supabase/client";

export function ReportActions({ reportId, entityType, entityId }: { reportId: string; entityType: string; entityId: string }) {
  async function resolve(status: string) {
    const supabase = createClient();
    await supabase.from("reports").update({ status, resolved_at: new Date().toISOString() }).eq("id", reportId);
    window.location.reload();
  }

  return (
    <div className="mt-3 flex gap-2">
      <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={() => resolve("resolved")}>Resolve</button>
      <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={() => resolve("dismissed")}>Dismiss</button>
    </div>
  );
}
`);

write("app/admin/billing/page.tsx", `import { redirect } from "next/navigation";
import { requireAdminOnly } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBillingPage() {
  const profile = await requireAdminOnly();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(30);
  const { data: commissions } = await supabase.from("commission_records").select("*").order("created_at", { ascending: false }).limit(30);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Billing</h1>
      <section><h2 className="font-semibold">Orders</h2>{orders?.map((o) => <div key={o.id} className="card mt-2 p-3 text-sm">{o.order_type} — {o.amount} {o.currency} — {o.status}</div>)}</section>
      <section><h2 className="font-semibold">Commissions</h2>{commissions?.map((c) => <div key={c.id} className="card mt-2 p-3 text-sm">{c.deal_description} — {c.commission_amount ?? "TBD"} — {c.payment_status}</div>)}</section>
    </div>
  );
}
`);

write("app/admin/analytics/page.tsx", `import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("analytics_counts").select("*").single();
  const entries = data ? Object.entries(data).filter(([k]) => k !== "undefined") : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="card p-4"><p className="text-sm capitalize text-[var(--color-muted)]">{key.replace(/_/g, " ")}</p><p className="text-2xl font-bold">{String(value)}</p></div>
        ))}
      </div>
    </div>
  );
}
`);

write("app/admin/users/page.tsx", `import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("id, email, full_name, role, is_suspended, created_at").order("created_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      {users?.map((u) => (
        <div key={u.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
          <div><p className="font-medium">{u.full_name ?? u.email}</p><p className="text-sm text-[var(--color-muted)]">{u.role}{u.is_suspended ? " · SUSPENDED" : ""}</p></div>
          <SuspendUserButton userId={u.id} isSuspended={u.is_suspended} />
        </div>
      ))}
    </div>
  );
}
`);

write("components/admin/SuspendUserButton.tsx", `"use client";

import { createClient } from "@/lib/supabase/client";

export function SuspendUserButton({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  async function toggle() {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_suspended: !isSuspended }).eq("id", userId);
    window.location.reload();
  }
  return <button type="button" className="btn btn-secondary text-sm py-1 px-3" onClick={toggle}>{isSuspended ? "Unsuspend" : "Suspend"}</button>;
}
`);

write("app/admin/health/page.tsx", `import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HealthRequestAdminNotes } from "@/components/admin/HealthRequestAdminNotes";

export default async function AdminHealthPage() {
  const profile = await requireAdmin();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data } = await supabase.from("health_requests").select("*").order("created_at", { ascending: false }).limit(30);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Health Requests</h1>
      {data?.map((r) => (
        <div key={r.id} className="card p-4">
          <p className="font-medium">{r.horse_name ?? "Unnamed horse"} — {r.urgency} — {r.status}</p>
          <p className="text-sm">{r.issue_description}</p>
          {r.video_url && <a href={r.video_url} className="text-sm">View video</a>}
          <HealthRequestAdminNotes requestId={r.id} initialNotes={r.admin_notes ?? ""} initialStatus={r.status} />
        </div>
      ))}
    </div>
  );
}
`);

write("components/admin/HealthRequestAdminNotes.tsx", `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HealthRequestAdminNotes({ requestId, initialNotes, initialStatus }: { requestId: string; initialNotes: string; initialStatus: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(false);

  async function save() {
    const supabase = createClient();
    await supabase.from("health_requests").update({ admin_notes: notes, status }).eq("id", requestId);
    setSaved(true);
  }

  return (
    <div className="mt-3 space-y-2">
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">Open</option>
        <option value="in_review">In review</option>
        <option value="assigned">Assigned</option>
        <option value="closed">Closed</option>
      </select>
      <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Admin notes..." />
      <button type="button" className="btn btn-primary text-sm py-1 px-3" onClick={save}>{saved ? "Saved" : "Save"}</button>
    </div>
  );
}
`);

console.log("Admin pages created");
