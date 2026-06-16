import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A Sports Zone",
    short_name: "ASportsZone",
    description: "Jodhpur's trusted cricket & sports store — built for the pitch.",
    start_url: "/",
    display: "standalone",
    background_color: "#06070d",
    theme_color: "#06070d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
