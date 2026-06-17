import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifiedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { getCountryName } from "@/lib/countries";

export default async function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: seller } = await supabase.from("seller_profiles").select("*").eq("id", id).single();
  if (!seller) notFound();
  const { data: products } = await supabase.from("products").select("id, title, price, currency").eq("seller_id", id).eq("status", "published").limit(12);

  return (
    <div className="space-y-6">
      {seller.is_verified && <VerifiedBadge />}
      <h1 className="text-3xl font-bold">{seller.business_name}</h1>
      <p className="text-[var(--color-muted)]">{[seller.city, getCountryName(seller.country_code)].filter(Boolean).join(", ")}</p>
      {seller.logo_url && <img src={seller.logo_url} alt={seller.business_name} className="h-32 w-32 rounded-lg object-cover" />}
      <p>{seller.description}</p>
      <section>
        <h2 className="text-xl font-semibold">Products</h2>
        <ul className="mt-2 space-y-1">{products?.map((p) => <li key={p.id}><a href={`/marketplace/products/${p.id}`}>{p.title}</a></li>)}</ul>
      </section>
      <ReviewsSection entityType="seller" entityId={id} />
    </div>
  );
}
