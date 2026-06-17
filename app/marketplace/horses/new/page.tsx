"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    breed: "",
    city: "",
    country_code: "PK",
    price: "",
    currency: "USD",
    listing_type: "sale",
    gender: "",
    age: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/marketplace/horses/new");
      return;
    }
    const { data, error: err } = await supabase.from("horses").insert({
      owner_id: user.id,
      title: form.title.trim(),
      description: form.description || null,
      breed: form.breed || null,
      city: form.city || null,
      country_code: form.country_code,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      listing_type: form.listing_type,
      gender: form.gender || null,
      age: form.age ? parseInt(form.age, 10) : null,
      photos,
      video_url: videoUrl || null,
      status: "published",
    }).select("id").single();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/marketplace/horses/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">List a horse</h1>
      <p className="text-sm text-stone-600">Add multiple photos and an optional video — publishes immediately.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <Label required>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <MediaUpload
          imageBucket={STORAGE_BUCKETS.horses}
          photos={photos}
          onPhotosChange={setPhotos}
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          maxImages={12}
          imageLabel="Horse photos"
        />
        <div>
          <Label required>Description</Label>
          <Textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Breed</Label>
            <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          </div>
          <div>
            <Label>Listing type</Label>
            <Select value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
              <option value="sale">Sale</option>
              <option value="adoption">Adoption</option>
              <option value="stud">Stud</option>
              <option value="lease">Lease</option>
            </Select>
          </div>
          <div>
            <Label>Gender</Label>
            <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Mare, Gelding, Stallion" />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" min={0} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <Label required>Country</Label>
            <CountrySelect required value={form.country_code} onChange={(c) => setForm({ ...form, country_code: c })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Publishing…" : "Publish listing"}</Button>
      </form>
    </div>
  );
}
