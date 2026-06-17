import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "/",
  "/marketplace",
  "/marketplace/horses",
  "/marketplace/products",
  "/marketplace/services",
  "/marketplace/sellers",
  "/clubs",
  "/trainers",
  "/events",
  "/courses",
  "/blog",
  "/community",
  "/health",
  "/payments",
  "/support",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    const supabase = await createClient();
    const tables = [
      { table: "horses", prefix: "/marketplace/horses" },
      { table: "clubs", prefix: "/clubs" },
      { table: "trainers", prefix: "/trainers" },
      { table: "events", prefix: "/events" },
      { table: "courses", prefix: "/courses" },
      { table: "blog_posts", prefix: "/blog" },
      { table: "community_posts", prefix: "/community" },
      { table: "products", prefix: "/marketplace/products" },
      { table: "services", prefix: "/marketplace/services" },
    ] as const;

    for (const { table, prefix } of tables) {
      const { data } = await supabase
        .from(table)
        .select("id, updated_at")
        .eq("status", "published")
        .limit(500);
      if (data) {
        for (const row of data) {
          entries.push({
            url: absoluteUrl(`${prefix}/${row.id}`),
            lastModified: row.updated_at ? new Date(row.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Return static routes if Supabase unavailable during build
  }

  return entries;
}
