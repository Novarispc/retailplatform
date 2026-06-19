import type { Metadata } from "next";
import type { Viewport } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getStoreProfile } from "@/server/services/store";

// Display / headings — editorial, premium, distinctive
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

// Body / UI — clean, modern, premium feel at all weights
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// Mono — prices, codes, data
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getStoreProfile().catch(() => ({}));
  const name = (profile as { storeName?: string }).storeName ?? "ASPORTS ZONE";
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: `${name} — Built for the Pitch`,
      template: `%s · ${name}`,
    },
    description:
      "From local nets to big matches — trusted cricket gear for every player",
    keywords: ["cricket equipment", "cricket bat", "cricket shoes", "sports accessories", "BDM cricket", "DSC cricket", "360 cricket", "Jodhpur cricket store"],
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — Built for the Pitch`,
      description: "From local nets to big matches — trusted cricket gear for every player",
      url: appUrl,
    },
    twitter: { card: "summary_large_image" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: name },
    formatDetection: { telephone: false },
  };
}

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
      className={`${syne.variable} ${jakarta.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="aurora-bg flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
