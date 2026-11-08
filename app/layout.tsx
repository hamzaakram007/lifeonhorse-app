import type { ReactNode } from "react";

/**
 * Passthrough root layout required by Next.js.
 * `<html>` / `<body>` live in `app/[locale]/layout.tsx` so lang + dir
 * can follow the active locale (incl. RTL for ur/ar).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
