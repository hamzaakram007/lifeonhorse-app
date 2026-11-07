"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LISTING_TYPES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";
import { claimProfileRole } from "@/lib/profiles/claim-role";

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "sale",
    breed: "",
    age: "",
    gender: "",
    color: "",
    height: "",
    discipline: "",
    price: "",
    currency: "USD",
    country: "PK",
    city: "",
    health_notes: "",
    pedigree_notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Please enter a listing title.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/marketplace/new");
      return;
    }

    const slug = slugify(form.title) + "-" + Date.now().toString(36);
    const { data, error: insertError } = await supabase
      .from("horses")
      .insert({
        owner_id: user.id,
        title: form.title.trim(),
        slug,
        description: form.description || null,
        listing_type: form.listing_type,
        breed: form.breed || null,
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
        color: form.color || null,
        height: form.height || null,
        discipline: form.discipline || null,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        country: form.country,
        city: form.city || null,
        health_notes: form.health_notes || null,
        pedigree_notes: form.pedigree_notes || null,
        photos,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("slug")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      const { error: roleError } = await claimProfileRole(supabase, "seller");
      if (roleError) {
        setError(roleError);
        setLoading(false);
        return;
      }
      router.push(`/marketplace/${data.slug}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">List a horse</h1>
      <p className="text-sm text-stone-600">Your listing publishes immediately. Add photos to stand out.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <ImageUpload
          bucket={STORAGE_BUCKETS.horses}
          label="Listing photos"
          multiple
          maxFiles={8}
          value={photos}
          onChange={setPhotos}
        />
        <div>
          <Label>Type</Label>
          <Select value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Breed</Label>
            <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" min={0} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <Label>Gender</Label>
            <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
          </div>
          <div>
            <Label>Color</Label>
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div>
            <Label required>Country</Label>
            <CountrySelect required value={form.country} onChange={(country) => setForm({ ...form, country })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing…" : "Publish listing"}
        </Button>
      </form>
    </div>
  );
}
