"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "other",
    price: "",
    currency: "USD",
    country: "PK",
    city: "",
    description: "",
  });

  useEffect(() => {
    async function loadSeller() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/marketplace/products/new");
        return;
      }
      const { data: seller } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!seller) {
        router.push("/marketplace/sellers/register?redirect=/marketplace/products/new");
        return;
      }
      setSellerId(seller.id);
    }
    loadSeller();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sellerId) return;
    setError("");
    if (!form.title.trim()) {
      setError("Please enter a product title.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: sellerId,
        title: form.title.trim(),
        category: form.category,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        country_code: form.country,
        description: [
          form.city ? `${form.description}\n\nCity: ${form.city}`.trim() : form.description,
          videoUrl && `Product video: ${videoUrl}`,
        ].filter(Boolean).join("\n\n") || null,
        photos,
        status: "published",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    if (data) router.push(`/marketplace/products/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MarketplaceNav />
      <h1 className="mt-6 text-2xl font-bold">List a product</h1>
      <p className="text-sm text-stone-600">Add photos and details — your listing publishes immediately.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <MediaUpload
          imageBucket={STORAGE_BUCKETS.gallery}
          photos={photos}
          onPhotosChange={setPhotos}
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          maxImages={10}
          imageLabel="Product photos"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
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
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading || !sellerId}>
          {loading ? "Publishing…" : "Publish product"}
        </Button>
      </form>
    </div>
  );
}
