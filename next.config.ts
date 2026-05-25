import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product imagery is served from the source CDN by default. When images are
    // migrated (run scripts/download-images.mjs + set NEXT_PUBLIC_IMAGE_BASE),
    // add that origin here too.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fcglcdn.com",
        pathname: "/brainbees/images/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
