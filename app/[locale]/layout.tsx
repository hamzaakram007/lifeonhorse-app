import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PwaProvider } from "@/components/PwaProvider";
import {
  notoNaskhArabic,
  notoNastaliqUrdu,
  playfair,
  sourceSans,
} from "@/lib/fonts";
import { defaultMetadata } from "@/lib/seo";
import { isRtlLocale, routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  ...defaultMetadata,
  applicationName: "LifeOnHorse",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOnHorse",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#c45c26",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const rtl = isRtlLocale(locale);

  const fontVars = [
    playfair.variable,
    sourceSans.variable,
    notoNaskhArabic.variable,
    notoNastaliqUrdu.variable,
  ].join(" ");

  const scriptClass =
    locale === "ar"
      ? "font-arabic"
      : locale === "ur"
        ? "font-urdu"
        : "";

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={fontVars}>
      <body className={`flex min-h-screen flex-col font-sans ${scriptClass}`}>
        <NextIntlClientProvider messages={messages}>
          <PwaProvider>
            <Header />
            <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
              {children}
            </main>
            <Footer />
          </PwaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
