import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureCards } from "@/components/home/FeatureCards";
import { AboutSection } from "@/components/home/AboutSection";
import { BlogSection } from "@/components/home/BlogSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Global Horse Marketplace & Community",
  description:
    "Discover exceptional horses, elite clubs, expert trainers, and a worldwide equestrian community.",
  path: "/",
});

export default async function HomePage() {
  const supabase = await createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("id, title, cover_image, excerpt")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .limit(3);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LifeOnHorse",
    url: absoluteUrl("/"),
    description: "Global horse marketplace, clubs, trainers, and community",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LifeOnHorse",
    url: absoluteUrl("/"),
  };

  return (
    <div className="-mt-8 -mb-8 space-y-0">
      <JsonLd data={[orgJsonLd, websiteJsonLd]} />
      <HeroSection />
      <FeatureCards />
      <AboutSection />
      <BlogSection posts={blogPosts ?? []} />
    </div>
  );
}
