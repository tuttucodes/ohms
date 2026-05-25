import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product imagery is served from the source CDN by default. Admins can also
    // paste image URLs from other origins, so https hosts are allowed broadly to
    // avoid next/image throwing on unlisted domains. Tighten in a locked-down
    // deployment if you only use known origins.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.fcglcdn.com", pathname: "/brainbees/images/**" },
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
