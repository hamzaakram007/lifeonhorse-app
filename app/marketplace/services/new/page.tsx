"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav";
import { SERVICE_CATEGORIES, PRICING_MODELS } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "other",
    country: "PK",
    city: "",
    description: "",
    pricing_model: "quote",
    pricing_details: "",
    availability: "",
    price: "",
    currency: "USD",
  });

  useEffect(() => {
    async function loadSeller() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/marketplace/services/new");
        return;
      }
      const { data: seller } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!seller) {
        router.push("/marketplace/sellers/register?redirect=/marketplace/services/new");
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
      setError("Please enter a service title.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const descriptionParts = [
      form.description,
      form.pricing_details && `Pricing: ${form.pricing_details} (${form.pricing_model.replace(/_/g, " ")})`,
      form.availability && `Availability: ${form.availability}`,
      form.city && `City: ${form.city}`,
    ].filter(Boolean);

    const { data, error: insertError } = await supabase
      .from("services")
      .insert({
        seller_id: sellerId,
        title: form.title.trim(),
        category: form.category,
        country_code: form.country,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        description: descriptionParts.join("\n\n") || null,
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
    if (data) router.push(`/marketplace/services/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MarketplaceNav />
      <h1 className="mt-6 text-2xl font-bold">List a service</h1>
      <p className="text-sm text-stone-600">Describe your service and how clients can reach you.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Title</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Service photos" multiple maxFiles={6} value={photos} onChange={setPhotos} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Pricing model</Label>
            <Select value={form.pricing_model} onChange={(e) => setForm({ ...form, pricing_model: e.target.value })}>
              {PRICING_MODELS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Country</Label>
            <CountrySelect required value={form.country} onChange={(country) => setForm({ ...form, country })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Price (optional)</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Pricing details</Label>
          <Input placeholder="e.g. $50/visit, quote on request" value={form.pricing_details} onChange={(e) => setForm({ ...form, pricing_details: e.target.value })} />
        </div>
        <div>
          <Label>Availability</Label>
          <Input placeholder="e.g. Mon–Sat, 24/7 emergency" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading || !sellerId}>
          {loading ? "Publishing…" : "Publish service"}
        </Button>
      </form>
    </div>
  );
}
