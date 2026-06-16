import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ASPORTS ZONE — Built for the Pitch",
    template: "%s · ASPORTS ZONE",
  },
  description:
    "ASPORTS ZONE — Jodhpur's trusted cricket & sports store. Bats, combos, shoes and accessories from 360, BDM, DSC, EM and more. Where the trust builds.",
  keywords: ["cricket equipment", "cricket bat", "cricket shoes", "sports accessories", "BDM cricket", "DSC cricket", "360 cricket", "Jodhpur cricket store"],
  openGraph: {
    type: "website",
    siteName: "ASPORTS ZONE",
    title: "ASPORTS ZONE — Built for the Pitch",
    description: "Jodhpur's trusted cricket & sports store. Where the trust builds.",
    url: appUrl,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "24Sports" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#06070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="aurora-bg flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
