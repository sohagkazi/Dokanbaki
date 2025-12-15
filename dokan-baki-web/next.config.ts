import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the specific IP and localhost for development
  // @ts-ignore
  allowedDevOrigins: ["localhost:3000", "10.207.160.129:3000", "10.207.160.129"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);
