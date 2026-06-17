"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", content: "", country: "PK" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and story content are required.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/community/stories/new");
      return;
    }

    const { error: insertError } = await supabase.from("user_stories").insert({
      author_id: user.id,
      title: form.title.trim(),
      content: form.content,
      country: form.country,
      photos,
      status: "published",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/community");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Share your story</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label required>Story</Label>
          <Textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div>
          <Label>Country</Label>
          <CountrySelect value={form.country} onChange={(country) => setForm({ ...form, country })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Story photos" multiple maxFiles={4} value={photos} onChange={setPhotos} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing…" : "Publish story"}
        </Button>
      </form>
    </div>
  );
}
