"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

/**
 * Registers the Serwist service worker in production only.
 * Dev stays clear of SW caching; test with `next build && next start` over HTTPS
 * (or localhost) and Chrome DevTools → Application → Service Workers / Offline.
 */
export function PwaProvider({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV !== "production"}
      register
      cacheOnNavigation={false}
      reloadOnOnline
      // Turbopack Serwist emits a classic IIFE bundle, not an ES module.
      options={{ type: "classic", scope: "/" }}
    >
      {children}
    </SerwistProvider>
  );
}
