"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewGalleryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState({ horse_name: "", breed: "", country: "PK", caption: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!imageUrls.length) {
      setError("Please upload at least one photo.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/community/gallery/new");
      return;
    }

    const title = form.horse_name.trim() || "Gallery photo";
    const content = [
      form.caption,
      form.breed && `Breed: ${form.breed}`,
      form.country && `Country: ${form.country}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error: insertError } = await supabase.from("community_posts").insert({
      author_id: user.id,
      title,
      content: content || null,
      photos: imageUrls,
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
      <h1 className="text-2xl font-bold">Add to horse gallery</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Photo" required value={imageUrls} onChange={setImageUrls} />
        <div>
          <Label>Horse name</Label>
          <Input value={form.horse_name} onChange={(e) => setForm({ ...form, horse_name: e.target.value })} />
        </div>
        <div>
          <Label>Breed</Label>
          <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </div>
        <div>
          <Label>Country</Label>
          <CountrySelect value={form.country} onChange={(country) => setForm({ ...form, country })} />
        </div>
        <div>
          <Label>Caption</Label>
          <Textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading || !imageUrls.length}>
          {loading ? "Uploading…" : "Publish to gallery"}
        </Button>
      </form>
    </div>
  );
}
