import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
} satisfies NextConfig

export default nextConfig
