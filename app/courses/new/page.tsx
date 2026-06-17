"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "care", is_free: "true", price: "", currency: "USD" });
  const [coverImage, setCoverImage] = useState<string[]>([]);
  const [promoPhotos, setPromoPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/courses/new");
      return;
    }
    const description = [
      form.description,
      promoPhotos.length > 0 && `Gallery: ${promoPhotos.join(", ")}`,
      videoUrl && `Promo video: ${videoUrl}`,
    ].filter(Boolean).join("\n\n");

    const { data, error: err } = await supabase.from("courses").insert({
      creator_id: user.id,
      title: form.title.trim(),
      description: description || null,
      category: form.category,
      cover_image: coverImage[0] ?? null,
      is_free: form.is_free === "true",
      price: form.is_free === "false" && form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      status: "published",
    }).select("id").single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/courses/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Create course</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Title</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Cover image" value={coverImage} onChange={setCoverImage} />
      <MediaUpload
        imageBucket={STORAGE_BUCKETS.gallery}
        photos={promoPhotos}
        onPhotosChange={setPromoPhotos}
        videoUrl={videoUrl}
        onVideoChange={setVideoUrl}
        maxImages={6}
        imageLabel="Course preview photos"
      />
      <div>
        <Label>Description</Label>
        <Textarea className="min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Category</Label>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="care">Horse Care</option>
            <option value="training">Training</option>
            <option value="health">Health</option>
            <option value="business">Business</option>
          </Select>
        </div>
        <div>
          <Label>Pricing</Label>
          <Select value={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.value })}>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </Select>
        </div>
        {form.is_free === "false" && (
          <>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
          </>
        )}
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Publishing…" : "Publish course"}</Button>
    </form>
  );
}
