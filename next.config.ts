import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly instructs Next.js to scan your local project workspace context
  turbopack: {
    root: "./",
  },
};

export default nextConfig;

