"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "guides" });
  const [coverImage, setCoverImage] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/blog/new");
      return;
    }
    const slug = form.slug || slugify(form.title) + "-" + Date.now().toString(36);
    const { data, error: err } = await supabase.from("blog_posts").insert({
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category,
      cover_image: coverImage[0] ?? null,
      author_id: user.id,
      status: "published",
    }).select("id").single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/blog/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Write article</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Title</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Cover image" value={coverImage} onChange={setCoverImage} />
      <div>
        <Label>Excerpt</Label>
        <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary for listings" />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="guides">Guides</option>
          <option value="training">Training</option>
          <option value="health">Health</option>
          <option value="culture">Culture</option>
          <option value="events">Events</option>
          <option value="polo">Polo</option>
          <option value="tent_pegging">Tent Pegging</option>
          <option value="tack">Tack</option>
          <option value="nutrition">Nutrition</option>
          <option value="buying_guide">Buying Guide</option>
        </Select>
      </div>
      <div>
        <Label required>Content</Label>
        <Textarea className="min-h-40" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Publishing…" : "Publish article"}</Button>
    </form>
  );
}
