import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '75.119.150.209',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      }
    ],
  },
  output: 'standalone',
};

export default nextConfig;