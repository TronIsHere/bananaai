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
  // Note: Body size limits in Next.js App Router are typically controlled
  // by the deployment platform (e.g., Vercel has a 4.5MB limit).
  // For larger uploads, consider using direct S3 uploads with presigned URLs
  // or configuring your reverse proxy (nginx, etc.) if self-hosted.
};

export default nextConfig;
