import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
    // Only add offline HTML shells here. manifest.json + icons are already
    // picked up from /public — duplicate precache URLs make Serwist throw
    // during SW evaluation and registration fails.
    additionalPrecacheEntries: [
      { url: "/~offline", revision },
      { url: "/ur/~offline", revision },
      { url: "/ar/~offline", revision },
    ],
  });
