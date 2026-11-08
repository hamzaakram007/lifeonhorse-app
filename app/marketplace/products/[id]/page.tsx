import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { labelFromOptions } from "@/lib/labels";
import { resolveProductPhotos } from "@/lib/product-covers";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  const photos = resolveProductPhotos(product.id, product.title, product.photos);
  const categoryLabel = labelFromOptions(PRODUCT_CATEGORIES, product.category);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="text-[var(--color-muted)]">
          {[categoryLabel, product.country_code].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xl font-semibold">
          {product.price ? `${product.currency ?? "USD"} ${product.price}` : "Price on request"}
        </p>
      </div>
      <ListingGallery photos={photos} alt={product.title} />
      {product.description ? <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p> : null}
      <ReviewsSection entityType="product" entityId={id} />
    </div>
  );
}
