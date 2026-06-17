"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewBlogPage() {
  const [form, setForm] = useState({ title: "", slug: "", content: "", category: "guides" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").slice(0, 80);
    await supabase.from("blog_posts").insert({ ...form, slug, author_id: user.id });
    window.location.href = "/blog";
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Write article</h1>
      <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div><label className="label">Content</label><textarea className="input min-h-40" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>Publish</button>
    </form>
  );
}
