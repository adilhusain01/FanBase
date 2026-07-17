import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "a.espncdn.com" }] },
  turbopack: { root: __dirname },
};

export default nextConfig;
