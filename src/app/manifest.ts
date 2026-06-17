import type { MetadataRoute } from "next";
import { getStoreProfile } from "@/server/services/store";

// Render per-request so the manifest reflects the current store name from the DB.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const profile = await getStoreProfile().catch(() => ({}));
  const name = (profile as { storeName?: string }).storeName ?? "ASPORTS ZONE";
  return {
    name,
    short_name: name.replace(/\s+/g, ""),
    description: "From local nets to big matches — trusted cricket gear for every player",
    start_url: "/",
    display: "standalone",
    background_color: "#06070d",
    theme_color: "#06070d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
