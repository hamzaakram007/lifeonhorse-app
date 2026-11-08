import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureCards } from "@/components/home/FeatureCards";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { AboutSection } from "@/components/home/AboutSection";
import { BlogSection } from "@/components/home/BlogSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { resolveBlogCover } from "@/lib/blog-covers";
import { DUPLICATE_CLUB_IDS, resolveClubCover } from "@/lib/club-covers";
import { CLUB_TYPES, COURSE_CATEGORIES, EVENT_TYPES } from "@/lib/constants";
import { labelFromOptions, humanizeSlug } from "@/lib/labels";
import { formatLocation } from "@/lib/location";
import { firstPhoto } from "@/lib/storage/upload";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Global Horse Marketplace & Community",
  description:
    "Discover exceptional horses, elite clubs, expert trainers, and a worldwide equestrian community.",
  path: "/",
});

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: blogPosts },
    { data: clubActivityPosts },
    { data: featuredHorses },
    { data: featuredClubs },
    { data: featuredTrainers },
    { data: featuredEvents },
    { data: featuredCourses },
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, cover_image, excerpt")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .limit(3),
    supabase
      .from("blog_posts")
      .select("id, title, cover_image, excerpt, linked_entity_id")
      .eq("status", "published")
      .eq("linked_entity_type", "club")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("horses")
      .select("id, title, photos, price, currency, city, country_code")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(4),
    supabase
      .from("clubs")
      .select("id, name, club_type, logo_url, photos, city, country_code")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(8),
    supabase
      .from("trainers")
      .select("id, display_name, specialty, photos, city, country_code")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(4),
    supabase
      .from("events")
      .select("id, title, event_type, photos, city, country_code")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(4),
    supabase
      .from("courses")
      .select("id, title, category, cover_image")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(4),
  ]);

  const clubs = (featuredClubs ?? [])
    .filter((c) => !DUPLICATE_CLUB_IDS.has(c.id))
    .slice(0, 4);

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
      <FeaturedListings
        title="Featured Horses"
        viewAllHref="/marketplace/horses"
        items={(featuredHorses ?? []).map((h) => ({
          id: h.id,
          href: `/marketplace/horses/${h.id}`,
          title: h.title,
          image: firstPhoto(h.photos),
          subtitle: formatLocation(h.city, h.country_code) || undefined,
          meta: formatPrice(h.price, h.currency ?? "USD"),
        }))}
      />
      <FeaturedListings
        title="Featured Clubs"
        viewAllHref="/clubs"
        items={clubs.map((c) => ({
          id: c.id,
          href: `/clubs/${c.id}`,
          title: c.name,
          subtitle: labelFromOptions(CLUB_TYPES, c.club_type) || undefined,
          image: resolveClubCover(c.id, c.name, c.photos, c.logo_url),
          meta: formatLocation(c.city, c.country_code) || undefined,
        }))}
      />
      <FeaturedListings
        title="Featured Trainers"
        viewAllHref="/trainers"
        items={(featuredTrainers ?? []).map((t) => ({
          id: t.id,
          href: `/trainers/${t.id}`,
          title: t.display_name,
          subtitle: humanizeSlug(t.specialty) || undefined,
          image: firstPhoto(t.photos),
          meta: formatLocation(t.city, t.country_code) || undefined,
        }))}
      />
      <FeaturedListings
        title="Featured Events"
        viewAllHref="/events"
        items={(featuredEvents ?? []).map((e) => ({
          id: e.id,
          href: `/events/${e.id}`,
          title: e.title,
          subtitle: labelFromOptions(EVENT_TYPES, e.event_type) || undefined,
          image: firstPhoto(e.photos),
          meta: formatLocation(e.city, e.country_code) || undefined,
        }))}
      />
      <FeaturedListings
        title="Featured Courses"
        viewAllHref="/courses"
        items={(featuredCourses ?? []).map((c) => ({
          id: c.id,
          href: `/courses/${c.id}`,
          title: c.title,
          subtitle: labelFromOptions(COURSE_CATEGORIES, c.category) || undefined,
          image: c.cover_image,
        }))}
      />
      <FeaturedListings
        title="Latest from clubs"
        viewAllHref="/blog?entity_type=club"
        items={(clubActivityPosts ?? []).map((p) => ({
          id: p.id,
          href: `/blog/${p.id}`,
          title: p.title,
          image: resolveBlogCover(p.title, p.cover_image),
          subtitle: p.excerpt?.slice(0, 80) || "Club update",
        }))}
      />
      <AboutSection />
      <BlogSection
        posts={(blogPosts ?? []).map((p) => ({
          ...p,
          cover_image: resolveBlogCover(p.title, p.cover_image),
        }))}
      />
    </div>
  );
}
