import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["i.ibb.co", "i.ibb.co.com", "wordpress.meditime.com.bd", "cdn.codeopx.com", "i.imgbb.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wordpress.meditime.com.bd",
      },
      {
        protocol: "https",
        hostname: "i.imgbb.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

export default nextConfig;
