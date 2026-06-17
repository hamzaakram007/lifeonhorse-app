import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{product.title}</h1>
      <p>{product.price ? `${product.currency} ${product.price}` : "Price on request"}</p>
      <ListingGallery photos={product.photos} alt={product.title} />
      <p>{product.description}</p>
      <ReviewsSection entityType="product" entityId={id} />
    </div>
  );
}
