const fs = require("fs");
const path = require("path");

function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(process.cwd(), rel)), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), rel), content);
}

// Generic list page template
function listPage(config) {
  return `import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { getCountryName } from "@/lib/countries";

export const metadata: Metadata = {
  title: "${config.title}",
  description: "${config.description}",
};

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("${config.table}").select("${config.select}").eq("status", "published").order("is_featured", { ascending: false }).limit(24);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">${config.heading}</h1>
          <p className="text-[var(--color-muted)]">${config.subheading}</p>
        </div>
        ${config.createLink ? `<Link href="${config.createLink}" className="btn btn-primary">+ Create</Link>` : ""}
      </div>
      {!data?.length ? (
        <EmptyState title="No listings yet" description="Be the first to add one." ${config.createLink ? `action={<Link href="${config.createLink}" className="btn btn-primary">Create</Link>}` : ""} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item: Record<string, unknown>) => (
            <ListingCard
              key={String(item.id)}
              href={\`${config.detailPrefix}/\${item.id}\`}
              title={String(${config.titleField})}
              subtitle={${config.subtitleExpr}}
              image={${config.imageExpr}}
              badges={<>{item.is_verified ? <VerifiedBadge /> : null}{item.is_featured ? <FeaturedBadge /> : null}</>}
              meta={${config.metaExpr || "undefined"}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
`;
}

write("app/marketplace/page.tsx", `import Link from "next/link";

const tabs = [
  { href: "/marketplace/horses", label: "Horses", desc: "Buy, sell, adopt" },
  { href: "/marketplace/products", label: "Products", desc: "Tack & gear" },
  { href: "/marketplace/services", label: "Services", desc: "Professional services" },
  { href: "/marketplace/sellers", label: "Sellers", desc: "Seller directory" },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="card p-6 no-underline hover:shadow-md">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">{t.label}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

write("app/marketplace/horses/page.tsx", listPage({
  title: "Horses for Sale",
  description: "Browse horse listings worldwide",
  heading: "Horse Marketplace",
  subheading: "Sale, adoption, stud, lease, and wanted listings",
  table: "horses",
  select: "id, title, price, currency, city, country_code, photos, is_featured",
  createLink: "/marketplace/horses/new",
  detailPrefix: "/marketplace/horses",
  titleField: "item.title",
  subtitleExpr: "[item.city, getCountryName(item.country_code as string)].filter(Boolean).join(', ')",
  imageExpr: "Array.isArray(item.photos) ? (item.photos as string[])[0] : null",
  metaExpr: "item.price ? `${item.currency ?? 'USD'} ${item.price}` : 'Price on request'",
}));

write("app/marketplace/products/page.tsx", listPage({
  title: "Products",
  description: "Horse products and tack marketplace",
  heading: "Product Marketplace",
  subheading: "Tack, feed, equipment and more",
  table: "products",
  select: "id, title, price, currency, category, photos, is_featured",
  createLink: null,
  detailPrefix: "/marketplace/products",
  titleField: "item.title",
  subtitleExpr: "String(item.category ?? '')",
  imageExpr: "Array.isArray(item.photos) ? (item.photos as string[])[0] : null",
  metaExpr: "item.price ? `${item.currency ?? 'USD'} ${item.price}` : undefined",
}));

write("app/marketplace/services/page.tsx", listPage({
  title: "Services",
  description: "Horse services marketplace",
  heading: "Service Marketplace",
  subheading: "Transport, training, grooming and more",
  table: "services",
  select: "id, title, price, currency, category, photos, is_featured",
  createLink: null,
  detailPrefix: "/marketplace/services",
  titleField: "item.title",
  subtitleExpr: "String(item.category ?? '')",
  imageExpr: "Array.isArray(item.photos) ? (item.photos as string[])[0] : null",
  metaExpr: "item.price ? `${item.currency ?? 'USD'} ${item.price}` : undefined",
}));

write("app/marketplace/sellers/page.tsx", listPage({
  title: "Seller Directory",
  description: "Verified horse sellers worldwide",
  heading: "Seller Directory",
  subheading: "Find trusted sellers in your region",
  table: "seller_profiles",
  select: "id, business_name, city, country_code, logo_url, is_verified, is_featured",
  createLink: "/dashboard/seller",
  detailPrefix: "/marketplace/sellers",
  titleField: "item.business_name",
  subtitleExpr: "[item.city, getCountryName(item.country_code as string)].filter(Boolean).join(', ')",
  imageExpr: "item.logo_url as string | null",
  metaExpr: "undefined",
}));

const modules = [
  ["clubs", "clubs", "name", "club_type", "Clubs", "Horse clubs and communities worldwide", "/clubs/new", "logo_url"],
  ["trainers", "trainers", "display_name", "specialty", "Trainers", "Riding coaches, vets, farriers and experts", "/trainers/new", "photos"],
  ["events", "events", "title", "event_type", "Events", "Shows, competitions, camps and meetups", "/events/new", "photos"],
  ["courses", "courses", "title", "category", "Courses", "Learn horse care, riding, and business skills", "/courses/new", "cover_image"],
  ["blog", "blog_posts", "title", "category", "Blog", "Articles, guides, and horse culture", "/blog/new", "cover_image"],
  ["community", "community_posts", "title", "content", "Community", "Stories, gallery, and discussions", "/community/new", "photos"],
];

for (const [dir, table, titleField, subField, heading, sub, createLink, imgField] of modules) {
  const imageExpr = imgField === "photos" ? "Array.isArray(item.photos) ? (item.photos as string[])[0] : null" : `item.${imgField} as string | null`;
  const subtitleExpr = subField === "content" ? "String((item.content as string)?.slice(0, 80) ?? '')" : `String(item.${subField} ?? '')`;
  write(`app/${dir}/page.tsx`, listPage({
    title: heading,
    description: sub,
    heading,
    subheading: sub,
    table,
    select: `id, ${titleField}, ${subField}, country_code, city, ${imgField}, is_verified, is_featured`,
    createLink,
    detailPrefix: `/${dir}`,
    titleField: `item.${titleField}`,
    subtitleExpr,
    imageExpr,
    metaExpr: "undefined",
  }));
}

write("app/health/page.tsx", `import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard, EmptyState, VerifiedBadge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Horse Health & Expert Help",
  description: "Connect with verified horse health experts worldwide.",
};

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: experts } = await supabase.from("experts").select("id, display_name, specialty, city, country_code, photos, is_verified, is_featured").eq("status", "published").limit(24);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-danger)] bg-red-50 p-4 text-sm">
        <strong>Emergency:</strong> LifeOnHorse is NOT for emergencies. Contact a licensed veterinarian immediately for colic, severe bleeding, or inability to stand.
        <Link href="/legal/health-disclaimer" className="ml-2 underline">Full disclaimer</Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Horse Health & Expert Help</h1>
          <p className="text-[var(--color-muted)]">Vets, nutritionists, farriers, and specialists</p>
        </div>
        <div className="flex gap-2">
          <Link href="/health/request" className="btn btn-primary">Submit health request</Link>
          <Link href="/health/experts/new" className="btn btn-secondary">Become an expert</Link>
        </div>
      </div>
      {!experts?.length ? (
        <EmptyState title="No experts yet" action={<Link href="/health/experts/new" className="btn btn-primary">Register as expert</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ListingCard key={e.id} href={\`/health/experts/\${e.id}\`} title={e.display_name} subtitle={e.specialty} image={Array.isArray(e.photos) ? e.photos[0] : null} badges={e.is_verified ? <VerifiedBadge /> : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
`);

console.log("Module pages created");
