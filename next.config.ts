import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.10.8'],
  reactCompiler: false,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [],
  },
  turbopack: {
    root: __dirname,
  },
} satisfies NextConfig;

export default nextConfig;
