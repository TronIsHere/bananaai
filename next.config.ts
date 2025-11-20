import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "whitediv.ir",
      },
    ],
  },
};

export default nextConfig;
