import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
