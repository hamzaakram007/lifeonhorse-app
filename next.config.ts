import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async redirects() {
    return [
      { source: "/health", destination: "/horse-health", permanent: true },
      { source: "/health/request", destination: "/horse-health/requests/new", permanent: true },
      { source: "/health/experts", destination: "/horse-health/experts", permanent: true },
      { source: "/health/experts/new", destination: "/horse-health/experts/apply", permanent: true },
      { source: "/health/experts/:id", destination: "/horse-health/experts/:id", permanent: true },
      // Locale-prefixed equivalents (as-needed keeps en unprefixed above)
      { source: "/:locale(ur|ar)/health", destination: "/:locale/horse-health", permanent: true },
      {
        source: "/:locale(ur|ar)/health/request",
        destination: "/:locale/horse-health/requests/new",
        permanent: true,
      },
      {
        source: "/:locale(ur|ar)/health/experts",
        destination: "/:locale/horse-health/experts",
        permanent: true,
      },
      {
        source: "/:locale(ur|ar)/health/experts/new",
        destination: "/:locale/horse-health/experts/apply",
        permanent: true,
      },
      {
        source: "/:locale(ur|ar)/health/experts/:id",
        destination: "/:locale/horse-health/experts/:id",
        permanent: true,
      },
    ];
  },
};

/** Serwist (Turbopack PWA) wrapped outside next-intl plugin. */
export default withSerwist(withNextIntl(nextConfig));
