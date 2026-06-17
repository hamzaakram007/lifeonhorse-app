import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LifeOnHorse — Global Horse Marketplace & Community",
    template: "%s | LifeOnHorse",
  },
  description:
    "Buy and sell horses, find clubs, trainers, events, courses, and expert horse health help worldwide.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOnHorse",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b4513",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
