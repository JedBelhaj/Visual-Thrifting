import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Item uploads carry multiple full-size photos.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
