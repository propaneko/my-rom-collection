import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
