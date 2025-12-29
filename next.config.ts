import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "whitediv.ir",
      },
      {
        protocol: "https",
        hostname: "menucaffe-test.storage.c2.liara.space",
      },
    ],
  },
};

export default nextConfig;
