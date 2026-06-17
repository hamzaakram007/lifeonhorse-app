import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { playfair, sourceSans } from "@/lib/fonts";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...defaultMetadata,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOnHorse",
  },
};

export const viewport: Viewport = {
  themeColor: "#c45c26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
