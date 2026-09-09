import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Item uploads carry multiple full-size photos.
      bodySizeLimit: "25mb",
    },
  },
  images: {
    // Photos uploaded in production are served from Vercel Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
