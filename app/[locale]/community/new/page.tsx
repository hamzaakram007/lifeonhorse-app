"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewCommunityPage() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    await supabase.from("community_posts").insert({ ...form, author_id: user.id });
    window.location.href = "/community";
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Share a story</h1>
      <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div><label className="label">Content</label><textarea className="input min-h-32" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>Publish</button>
    </form>
  );
}
