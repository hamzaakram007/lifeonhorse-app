import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";
import { OwnedList } from "@/components/dashboard/OwnedList";

export default async function SellerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/seller");

  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const [{ data: horses }, { data: products }, { data: services }] = seller
    ? await Promise.all([
        supabase
          .from("horses")
          .select("id, title, status, is_featured, listing_type")
          .eq("owner_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("id, title, status, category")
          .eq("seller_id", seller.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("services")
          .select("id, title, status, category")
          .eq("seller_id", seller.id)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const horseItems =
    horses?.map((h) => ({
      id: h.id,
      title: h.title,
      status: h.status,
      href: `/marketplace/horses/${h.id}`,
      editHref: `/marketplace/horses/${h.id}/edit`,
      meta: [h.listing_type, h.is_featured ? "featured" : null].filter(Boolean).join(" · ") || null,
    })) ?? [];

  const productItems =
    products?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/marketplace/products/${p.id}`,
      meta: p.category,
    })) ?? [];

  const serviceItems =
    services?.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      href: `/marketplace/services/${s.id}`,
      meta: s.category,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Seller dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Horses, products, and services you list.
        </p>
      </div>

      {seller ? (
        <>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">{seller.is_verified ? <VerifiedBadge /> : null}</div>
            <h2 className="text-xl font-semibold">{seller.business_name}</h2>
            {seller.description ? (
              <p className="text-sm text-[var(--color-muted)]">{seller.description}</p>
            ) : null}
          </div>
          <VerificationUpload entityType="seller" entityId={seller.id} />
          <OwnedList
            title="Your horses"
            items={horseItems}
            createHref="/marketplace/horses/new"
            createLabel="+ New horse"
            emptyDescription="No horse listings yet."
          />
          <OwnedList
            title="Products"
            items={productItems}
            createHref="/marketplace/products/new"
            createLabel="+ New product"
            emptyDescription="No products yet."
          />
          <OwnedList
            title="Services"
            items={serviceItems}
            createHref="/marketplace/services/new"
            createLabel="+ New service"
            emptyDescription="No services yet."
          />
        </>
      ) : (
        <EmptyState
          title="Set up your seller profile"
          description="Create a seller profile to start listing horses, products, and services."
          action={
            <Link href="/dashboard/seller/setup" className="btn btn-primary">
              Set up seller profile
            </Link>
          }
        />
      )}
    </div>
  );
}
