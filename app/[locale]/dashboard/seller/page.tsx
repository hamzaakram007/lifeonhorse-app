import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { VerifiedBadge, EmptyState } from "@/components/ui";
import { VerificationUpload } from "@/components/VerificationUpload";
import { OwnedList } from "@/components/dashboard/OwnedList";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";

export default async function SellerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/seller");

  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const [
    { data: horses },
    { data: products },
    { data: services },
    { data: pendingFeatured },
    journalResult,
  ] = seller
    ? await Promise.all([
        supabase
          .from("horses")
          .select("id, title, status, is_featured, listing_type")
          .eq("owner_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("id, title, status, category, is_featured")
          .eq("seller_id", seller.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("services")
          .select("id, title, status, category, is_featured")
          .eq("seller_id", seller.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("featured_listing_requests")
          .select("entity_type, entity_id")
          .eq("user_id", profile.id)
          .eq("status", "pending"),
        supabase
          .from("blog_posts")
          .select("id, title, status, linked_entity_id, published_at")
          .eq("author_id", profile.id)
          .eq("linked_entity_type", "seller")
          .eq("linked_entity_id", seller.id)
          .order("updated_at", { ascending: false })
          .limit(12),
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: null, error: null },
      ];

  const journalPosts = isMissingLinkedEntityColumn(journalResult.error)
    ? []
    : journalResult.data;

  const pendingKey = new Set(
    (pendingFeatured ?? []).map((r) => `${r.entity_type}:${r.entity_id}`)
  );

  const horseItems =
    horses?.map((h) => ({
      id: h.id,
      title: h.title,
      status: h.status,
      href: `/marketplace/horses/${h.id}`,
      editHref: `/marketplace/horses/${h.id}/edit`,
      meta: [h.listing_type, h.is_featured ? "featured" : null].filter(Boolean).join(" · ") || null,
      featureEntityType: "horse",
      isFeatured: Boolean(h.is_featured),
      featurePending: pendingKey.has(`horse:${h.id}`),
    })) ?? [];

  const productItems =
    products?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/marketplace/products/${p.id}`,
      meta: p.category,
      featureEntityType: "product",
      isFeatured: Boolean(p.is_featured),
      featurePending: pendingKey.has(`product:${p.id}`),
    })) ?? [];

  const serviceItems =
    services?.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      href: `/marketplace/services/${s.id}`,
      meta: s.category,
      featureEntityType: "service",
      isFeatured: Boolean(s.is_featured),
      featurePending: pendingKey.has(`service:${s.id}`),
    })) ?? [];

  const journalItems =
    journalPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/blog/${p.id}`,
      editHref: `/blog/${p.id}/edit`,
      meta: p.published_at ? new Date(p.published_at).toLocaleDateString() : "Listing story",
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Seller dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Horses, products, and services you list.{" "}
          <Link href="/payments" className="text-[var(--color-primary)] hover:underline">
            Payments & commissions
          </Link>
        </p>
      </div>

      {seller ? (
        <>
          <div className="card space-y-2 p-4">
            <div className="flex flex-wrap gap-2">{seller.is_verified ? <VerifiedBadge /> : null}</div>
            <h2 className="text-xl font-semibold">{seller.business_name}</h2>
            {seller.description ? (
              <p className="text-sm text-[var(--color-muted)]">{seller.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/marketplace/sellers/${seller.id}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                View public profile
              </Link>
              <Link
                href={`/blog/new?seller=${seller.id}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                Listing story
              </Link>
              <span className="text-[var(--color-muted)]">Status: {seller.status}</span>
            </div>
          </div>
          <VerificationUpload entityType="seller" entityId={seller.id} />
          <OwnedList
            title="Your journal"
            items={journalItems}
            createHref={`/blog/new?seller=${seller.id}`}
            createLabel="+ Listing story"
            emptyDescription="No Journal stories linked to your seller profile yet. Tell buyers about new arrivals or care guides."
          />
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
