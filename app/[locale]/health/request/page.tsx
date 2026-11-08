"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function HealthRequestPage() {
  const [form, setForm] = useState({ horse_name: "", issue_description: "", urgency: "normal", disclaimer_accepted: false, emergency_acknowledged: false });
  const [videoUrl, setVideoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadFile(file: File, folder: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const path = `${user.id}/${folder}/${Date.now()}-${file.name}`;
    await supabase.storage.from("uploads").upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
    return publicUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disclaimer_accepted || !form.emergency_acknowledged) { setError("You must accept all disclaimers."); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const allowed = await supabase.rpc("check_rate_limit", { p_identifier: user.id, p_action: "health_request", p_max: 5, p_window_minutes: 60 });
    if (allowed.data === false) { setError("Rate limit exceeded. Try again later."); setLoading(false); return; }
    const { error: err } = await supabase.from("health_requests").insert({ ...form, user_id: user.id, photos, video_url: videoUrl || null });
    setError(err?.message ?? "");
    if (!err) window.location.href = "/dashboard";
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Submit health request</h1>
      <div className="rounded-lg border-2 border-[var(--color-danger)] bg-red-50 p-4 text-sm">
        <strong>NOT FOR EMERGENCIES.</strong> If your horse has colic, severe bleeding, cannot stand, or has breathing distress, call a licensed veterinarian NOW.
        <Link href="/legal/health-disclaimer" className="ml-1 underline">Full disclaimer</Link>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Horse name</label><input className="input" value={form.horse_name} onChange={(e) => setForm({ ...form, horse_name: e.target.value })} /></div>
      <div><label className="label">Describe the issue</label><textarea className="input min-h-32" required value={form.issue_description} onChange={(e) => setForm({ ...form, issue_description: e.target.value })} /></div>
      <div><label className="label">Urgency</label><select className="input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option value="normal">Normal</option><option value="urgent">Urgent (non-emergency)</option></select></div>
      <div><label className="label">Photos</label><input type="file" accept="image/*" multiple onChange={async (e) => { const urls = []; for (const f of Array.from(e.target.files ?? [])) { const u = await uploadFile(f, "health"); if (u) urls.push(u); } setPhotos(urls); }} /></div>
      <div><label className="label">Video (optional)</label><input type="file" accept="video/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await uploadFile(f, "health-video"); if (u) setVideoUrl(u); } }} /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.emergency_acknowledged} onChange={(e) => setForm({ ...form, emergency_acknowledged: e.target.checked })} />I understand this is NOT for emergencies.</label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.disclaimer_accepted} onChange={(e) => setForm({ ...form, disclaimer_accepted: e.target.checked })} />I accept the health disclaimer and understand online advice is informational only.</label>
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Submitting..." : "Submit request"}</button>
    </form>
  );
}
