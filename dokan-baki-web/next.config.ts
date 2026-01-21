import type { NextConfig } from "next";

// Ensure Project ID is available for Firebase Admin
if (!process.env.GCLOUD_PROJECT) {
  process.env.GCLOUD_PROJECT = 'dokanbakikhata';
}
if (!process.env.GOOGLE_CLOUD_PROJECT) {
  process.env.GOOGLE_CLOUD_PROJECT = 'dokanbakikhata';
}

const nextConfig: NextConfig = {
  // Allow the specific IP and localhost for development
  // @ts-ignore
  // allowedDevOrigins: ["localhost:3000", "10.207.160.129:3000", "10.207.160.129"],

  // @ts-ignore
  // turbopack: {},
  output: 'standalone',
};

export default nextConfig;
