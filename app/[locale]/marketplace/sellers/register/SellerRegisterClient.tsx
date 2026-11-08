"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav";
import { SELLER_TYPES, PRODUCT_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { claimProfileRole } from "@/lib/profiles/claim-role";

function buildDescription(
  base: string,
  sellerType: string,
  categories: string[],
  deliveryAreas: string,
  payments: string[],
  contactPerson: string
) {
  const extras = [
    contactPerson && `Contact: ${contactPerson}`,
    sellerType && `Type: ${sellerType.replace(/_/g, " ")}`,
    categories.length && `Categories: ${categories.join(", ")}`,
    deliveryAreas && `Delivery: ${deliveryAreas}`,
    payments.length && `Payment: ${payments.join(", ")}`,
  ].filter(Boolean);
  if (!extras.length) return base || null;
  return [base, ...extras].filter(Boolean).join("\n\n");
}

export default function SellerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    seller_type: "individual",
    contact_person: "",
    country: "PK",
    city: "",
    whatsapp: "",
    contact_phone: "",
    contact_email: "",
    description: "",
  });

  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/marketplace/sellers/register");
        return;
      }
      const { data: seller } = await supabase.from("seller_profiles").select("*").eq("user_id", user.id).single();
      if (seller) {
        setExistingId(seller.id);
        setForm({
          business_name: seller.business_name,
          seller_type: "individual",
          contact_person: "",
          country: seller.country_code ?? "PK",
          city: seller.city ?? "",
          whatsapp: "",
          contact_phone: seller.phone ?? "",
          contact_email: seller.email ?? "",
          description: seller.description ?? "",
        });
        setLogoUrl(seller.logo_url ?? "");
      }
    }
    loadExisting();
  }, [router]);

  function toggleCategory(value: string) {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function togglePayment(method: string) {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.business_name.trim()) {
      setError("Please enter your business name.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      business_name: form.business_name.trim(),
      country_code: form.country,
      city: form.city || null,
      phone: form.contact_phone || form.whatsapp || null,
      email: form.contact_email || null,
      logo_url: logoUrl || null,
      description: buildDescription(
        form.description,
        form.seller_type,
        selectedCategories,
        deliveryAreas,
        selectedPayments,
        form.contact_person
      ),
      status: "published" as const,
    };

    if (existingId) {
      const { error: updateError } = await supabase.from("seller_profiles").update(payload).eq("id", existingId);
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      router.push(redirect ?? `/marketplace/sellers/${existingId}`);
    } else {
      const { data, error: insertError } = await supabase
        .from("seller_profiles")
        .insert({ user_id: user.id, ...payload })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
      const { error: roleError } = await claimProfileRole(supabase, "seller");
      if (roleError) {
        setError(roleError);
        setLoading(false);
        return;
      }
      router.push(redirect ?? `/marketplace/sellers/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MarketplaceNav />
      <h1 className="mt-6 text-2xl font-bold">{existingId ? "Edit seller profile" : "Register as seller"}</h1>
      <p className="text-sm text-stone-600">Set up your business profile to list products and services.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Business name</Label>
          <Input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.clubs} label="Logo" value={logoUrl ? [logoUrl] : []} onChange={(urls) => setLogoUrl(urls[0] ?? "")} maxFiles={1} />
        <div>
          <Label>Seller type</Label>
          <Select value={form.seller_type} onChange={(e) => setForm({ ...form, seller_type: e.target.value })}>
            {SELLER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Contact person</Label>
          <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Country</Label>
            <CountrySelect required value={form.country} onChange={(country) => setForm({ ...form, country })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Product categories you sell</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCategory(c.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedCategories.includes(c.value) ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Delivery areas (comma-separated)</Label>
          <Input placeholder="e.g. Lahore, Karachi, nationwide" value={deliveryAreas} onChange={(e) => setDeliveryAreas(e.target.value)} />
        </div>
        <div>
          <Label>Payment methods</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => togglePayment(m.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedPayments.includes(m.value) ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : existingId ? "Update profile" : "Publish seller profile"}
        </Button>
      </form>
    </div>
  );
}
