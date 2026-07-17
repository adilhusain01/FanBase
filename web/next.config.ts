import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "api.fifa.com" }, { protocol: "https", hostname: "crests.football-data.org" }] },
  turbopack: { root: __dirname },
};

export default nextConfig;
