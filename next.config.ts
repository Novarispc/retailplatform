import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Server Actions default to a 1 MB body limit — too small for logo/image
  // uploads, which crash with "A server error occurred" before our try/catch.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    // Next 16: images.domains deprecated — use remotePatterns.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "image1.jdomni.in" },
      { protocol: "https", hostname: "content.jdmagicbox.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    qualities: [60, 75, 90],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
