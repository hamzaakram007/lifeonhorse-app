/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** Strip optional /ur|/ar locale prefix for path checks. */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(ur|ar)(?=\/|$)/, "") || "/";
}

/** Auth / private HTML + APIs must never be served from cache. */
function isSensitivePath(pathname: string): boolean {
  const path = stripLocale(pathname);
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/auth") ||
    path.startsWith("/api/")
  );
}

/**
 * Careful runtime caching for Next 16 + listing photos:
 * - NetworkOnly for auth/dashboard/admin/API
 * - CacheFirst for hashed `/_next/static`
 * - StaleWhileRevalidate for fonts + `/_next/image` (bounded; avoids sticky 404s)
 * - NetworkFirst for public navigations / RSC (falls back to /~offline)
 */
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && isSensitivePath(pathname),
    handler: new NetworkOnly(),
  },
  {
    matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: new CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 8,
          maxAgeSeconds: 365 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: new StaleWhileRevalidate({
      cacheName: "google-fonts-stylesheets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 8,
          maxAgeSeconds: 7 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2)$/i,
    handler: new CacheFirst({
      cacheName: "static-font-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 16,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\/_next\/static.+\.(?:js|css|woff2)$/i,
    handler: new CacheFirst({
      cacheName: "next-static-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 96,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    // Next Image optimizer — SWR + short TTL so listing photo fixes propagate.
    matcher: /\/_next\/image\?url=.+$/i,
    handler: new StaleWhileRevalidate({
      cacheName: "next-image",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: "static-image-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: ({ request, url: { pathname }, sameOrigin }) =>
      request.headers.get("RSC") === "1" &&
      sameOrigin &&
      !isSensitivePath(pathname),
    handler: new NetworkFirst({
      cacheName: "pages-rsc",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    matcher: ({ request, url: { pathname }, sameOrigin }) =>
      request.mode === "navigate" && sameOrigin && !isSensitivePath(pathname),
    handler: new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 8,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname } }) =>
      sameOrigin && !pathname.startsWith("/api/") && !isSensitivePath(pathname),
    handler: new NetworkFirst({
      cacheName: "others",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          if (request.destination !== "document") return false;
          try {
            const path = new URL(request.url).pathname;
            if (path.startsWith("/ur/") || path === "/ur") return false;
            if (path.startsWith("/ar/") || path === "/ar") return false;
          } catch {
            /* ignore */
          }
          return true;
        },
      },
      {
        url: "/ur/~offline",
        matcher({ request }) {
          if (request.destination !== "document") return false;
          try {
            const path = new URL(request.url).pathname;
            return path.startsWith("/ur/") || path === "/ur";
          } catch {
            return false;
          }
        },
      },
      {
        url: "/ar/~offline",
        matcher({ request }) {
          if (request.destination !== "document") return false;
          try {
            const path = new URL(request.url).pathname;
            return path.startsWith("/ar/") || path === "/ar";
          } catch {
            return false;
          }
        },
      },
    ],
  },
});

serwist.addEventListeners();
