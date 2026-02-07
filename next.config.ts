import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'neoclone.screenscraper.fr',
      },
    ],
  },
};

export default nextConfig;
