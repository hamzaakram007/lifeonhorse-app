import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
    additionalPrecacheEntries: [
      // English (localePrefix: as-needed — unprefixed)
      { url: "/~offline", revision },
      // Localized offline fallbacks
      { url: "/ur/~offline", revision },
      { url: "/ar/~offline", revision },
      { url: "/manifest.json", revision },
      { url: "/icons/icon-192.png", revision },
      { url: "/icons/icon-512.png", revision },
    ],
  });
