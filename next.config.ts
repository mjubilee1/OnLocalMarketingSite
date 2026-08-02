import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/OnLocalMarketingSite",
  assetPrefix: "/OnLocalMarketingSite/",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
