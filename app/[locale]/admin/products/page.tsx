import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, seller_profiles(business_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold">Manage products</h1>
      <div className="mt-4 space-y-3">
        {products?.map((p) => (
          <div key={p.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-stone-500">
                  {p.seller_profiles?.business_name} · {p.category} · {p.status}
                </p>
                <div className="mt-1 flex gap-1">
                  {p.is_featured && <Badge variant="featured">Featured</Badge>}
                </div>
              </div>
              <AdminActions table="products" id={p.id} isFeatured={p.is_featured} status={p.status} />
            </div>
          </div>
        ))}
        {!products?.length && <p className="text-stone-500">No products yet.</p>}
      </div>
    </div>
  );
}
